const axios = require('axios');
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);

const Test = async (callback = (err = new Error) => { }) => {
    const response = await axios.get('http://3.1.189.234:8091/data/ttntest')

    const test_max = async (datamax) => {
        let max
        for (let index = 0; index < datamax.length; index++) {
            let element = datamax[index].data;
            if (element === undefined && datamax[index] !== undefined && typeof (datamax[index]) == 'number') {
                element = datamax[index]
            }
            if (index === 0) { max = element; }
            if (max < element) { max = element; }
        }
        // console.log('MAX : ' + max);
        return max
    }
    const test_min = async (datamin) => {
        let min
        for (let index = 0; index < datamin.length; index++) {
            let element = datamin[index].data;
            if (element === undefined && datamin[index] !== undefined && typeof (datamin[index]) == 'number') {
                element = datamin[index]
            }
            if (index === 0) { min = element; }
            if (min > element) { min = element; }
        }
        // console.log('MIN : ' + min);
        return min
    }
    const test_avg = async (dataavg) => {
        let avg, sum = 0
        for (let index = 0; index < dataavg.length; index++) {
            let element = dataavg[index].data;
            if (element === undefined && dataavg[index] !== undefined && typeof (dataavg[index]) == 'number') {
                element = dataavg[index]
            }
            sum += element;
        }
        avg = sum / data.length
        // console.log('AVG : ' + avg);
        return avg
    }
    const uniqBy = (arr, predicate) => {
        const cb = typeof predicate === 'function' ? predicate : (o) => o[predicate];

        return [...arr.reduce((map, item) => {
            const key = (item === null || item === undefined) ?
                item : cb(item);

            map.has(key) || map.set(key, item);

            return map;
        }, new Map()).values()];
    };

    const test_range = async (datarange, mindata, maxdata) => {
        let numberStart = mindata;
        let count = 0;
        let numberEnd = numberStart + 200 - 0.01;
        let map = []
        while (numberStart < maxdata) {
            if (numberEnd > maxdata) {
                numberEnd = maxdata
            }
            count = 0;
            // const b = uniqBy(datarange, 'id')
            // console.log(b);
            for (let index = 0; index < datarange.length; index++) {

                const element = datarange[index].data;
                if (numberStart <= element && element < numberEnd) {
                    count++
                }
            }
            // console.log('range between ' + numberStart + ' - ' + numberEnd + ' | Count : ' + count);
            map.push({
                range: Math.round(numberStart * 100) / 100 + ' - ' + Math.round(numberEnd * 100) / 100,
                count: count
            })
            count = 0;
            numberStart += 200;
            numberEnd = numberStart + 200 - 0.01

        }

        return map;
    }

    const data = uniqBy(response.data, 'id');
    let maxday, minday, resust = [];
    for (let index = 0; index < data.length; index++) {
        const element = data[index].timestamp;
        if (index === 0) { maxday = moment(element, 'YYYY-MM-DD').startOf('day'); minday = moment(element, 'YYYY-MM-DD').startOf('day'); };
        maxday = moment.max(moment(element, 'YYYY-MM-DD').startOf('day'), maxday);
        minday = moment.min(moment(element, 'YYYY-MM-DD').startOf('day'), minday);
    };

    let startDate = minday;
    let numberCount = 0, numberOfCount = 0, sum = 0;

    while (moment(startDate, 'YYYY-MM-DD').startOf('day').isBetween(moment(minday, 'YYYY-MM-DD').startOf('day'), moment(maxday, 'YYYY-MM-DD').startOf('day'), undefined, '[]')) {
        for (let index2 = 0; index2 < data.length; index2++) {
            const element = data[index2];
            if (moment(element.timestamp, 'YYYY-MM-DD').startOf('day').isBetween(moment(startDate, 'YYYY-MM-DD').startOf('day'), moment(startDate, 'YYYY-MM-DD').startOf('day'), undefined, '[]')) {
                sum += element.data;
                if (numberOfCount === 0) {
                    resust.push({
                        date: element.timestamp,
                        data: [element],
                        dataForPredict: [element.data],
                        max: 0,
                        min: 0,
                    })
                    numberOfCount++;
                } else {
                    resust[numberCount].data.push(element);
                    resust[numberCount].dataForPredict.push(element.data);
                }
            }
        };
        resust[numberCount].data.sort((a, b) => (moment(a.timestamp).format('YYYYMMDD') > moment(b.timestamp).format('YYYYMMDD')) ? 1 : (moment(a.timestamp).format('YYYYMMDD') === moment(b.timestamp).format('YYYYMMDD')) ? ((moment(a.timestamp).format('hhmmss') > moment(b.timestamp).format('hhmmss')) ? 1 : -1) : -1);
        // resust[numberCount].sum = sum / resust[numberCount].data.length;
        resust[numberCount].max = await test_max(resust[numberCount].dataForPredict);
        resust[numberCount].min = await test_min(resust[numberCount].dataForPredict);
        resust[numberCount].dataForPredict = [];
        startDate = moment(startDate).add(1, 'days');
        numberOfCount = 0;
        numberCount++;
    }

    const next_day = resust[resust.length - 1].max + (resust[resust.length - 1].max - resust[resust.length - 1].min);
    // console.log('result last day : ' + resust[resust.length - 1].max);
    // console.log('result next day : ' + next_day);

    const next_week = resust[resust.length - 1].max + (resust[resust.length - 1].max - resust[resust.length - 7].min);
    // console.log('result last week : ' + resust[resust.length - 7].min);
    // console.log('result next week : ' + next_week);

    const maxNumber = await test_max(data);
    const minNumber = await test_min(data);
    const avgNumber = await test_avg(data);
    const rangeNember = await test_range(data, minNumber, maxNumber)

    const map = {
        max: maxNumber,
        min: minNumber,
        avg: Math.round(avgNumber * 100) / 100,
        range200: rangeNember,
        last_day: resust[resust.length - 1].max,
        next_day: Math.round(next_day * 100) / 100,
        last_week: resust[resust.length - 7].min,
        next_week: Math.round(next_week * 100) / 100,
        data_bydate: resust
    }
    callback(null);
    return map;

}
// Test();
module.exports = Test;