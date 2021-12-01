const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const nodemailer = require('nodemailer');
// const csv2 = require('neat-csv');
const user = [
    {
        username: 'arm',
        password: 'arm'
    },
    {
        username: 'pang',
        password: 'pang'
    },
    {
        username: 'tarn',
        password: 'tarn'
    }
]

const approve = async (
    data = {
        username: new String(''),
        password: new String('')
    },
    callback = (err = new Error) => { }
) => {
    // let approveBefer = []
    let chackUser = 0
    let chackApproveBefer = 0

    // const a = fs.createReadStream('out.csv').pipe(csv()).on('data', (row) => { approveBefer.push(row); console.log(row); }).on('end', () => { console.log('CSV file successfully processed'); });
    // const a = fs.readFileSync('out.csv', 'utf8');
    // console.log(a);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'testsentemail01@gmail.com',
            pass: 'T123S456E789'
        }
    });



    // console.log(results);
    const countApprove = async () => {
        let approveBefer = fs.readFileSync("out.csv", "utf8");
        let allTextLines = approveBefer.split(/\r\n|\n/); // SPLIT ROWS
        let headers = allTextLines[0].split(',');
        let lines = [];
        for (let i = 1; i < allTextLines.length; i++) {
            let data2 = allTextLines[i].split(',');
            if (data2.length == headers.length) {

                let tarr = [];
                for (let j = 0; j < headers.length; j++) {
                    tarr.push(data2[j]);
                }
                lines.push(tarr);
            }
        }
        return lines.length
    }

    const fnWriteRecords = async (results, data) => {
        results.forEach(async element => { if (element.username === data.username.trim() && element.password === data.password.trim()) { chackApproveBefer = 1; } });
        if (chackApproveBefer === 0) {
            const csvWriter = createCsvWriter({
                path: 'out.csv',
                header: [
                    { id: 'id', title: 'id' },
                    { id: 'username', title: 'username' },
                    { id: 'password', title: 'password' },
                    { id: 'approve', title: 'approve' },
                ]
            });
            results.push({
                id: 1,
                username: data.username.trim(),
                password: data.password.trim(),
                approve: true,
            });
            csvWriter.writeRecords(results).then(async () => {
                console.log('await countApprove ' + await countApprove());
                if (await countApprove() == 3) {
                    let mailOptions = {
                        from: 'testsentemail01@gmail.com',
                        to: 'napat.s@swiftdynamics.co.th',
                        subject: 'Approve',
                        text: 'Approved for requirement'
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                    const csvWriter2 = createCsvWriter({
                        path: 'out.csv',
                        header: [
                            { id: 'id', title: 'id' },
                            { id: 'username', title: 'username' },
                            { id: 'password', title: 'password' },
                            { id: 'approve', title: 'approve' },
                        ]
                    });
                    csvWriter2
                }
                console.log('The CSV file was written successfully')
            });
        }
    }

    const numberApprove = await countApprove();

    // const results = fs.readFileSync('out.csv', 'utf8');
    // console.log('data', results);

    user.forEach(element => { if (element.username === data.username.trim() && element.password === data.password.trim()) { chackUser = 1; } });
    // results.forEach(element => { if (element.username === data.username.trim() && element.password === data.password.trim()) { chackApproveBefer = 1; } });

    if (chackUser === 0) {
        callback(null);
        return {
            username: data.username,
            password: data.password,
            approve: 'can not approve user low lavel'
        };
    } else if (chackUser === 1) {
        let results = []
        fs.createReadStream('out.csv')
            .pipe(csv())
            .on('data', (data) => { results.push(data); })
            .on('end', async () => {
                await fnWriteRecords(results, data);
            });
        callback(null);
        return {
            username: data.username,
            password: data.password,
            approve: 'approved'
        };
    } else {
        callback(null);
        return {
            username: data.username,
            password: data.password,
            approve: 'approved'
        };
    }



}
module.exports = approve;