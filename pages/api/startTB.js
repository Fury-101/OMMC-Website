const fs = require("fs")

export default function handler(req, res) {
    if (req.method === 'POST') {
        const data = req.body;

        const curdata = JSON.parse(fs.readFileSync(`../tests/tiebreaker_data.json`, {
            encoding: 'utf8',
            flag: 'r'
        }))

        if (curdata[data.teamname]) {
            res.status(200).send({ message: "Test has already been started.", time: curdata[data.teamname] })
        } else {
            curdata[data.teamname] = data.timeStarted;
            fs.writeFileSync(`../tests/tiebreaker_data.json`, JSON.stringify(curdata))
            res.status(200).send({ message: "Added time started." })
        }
    } else {
        res.status(405).send({ message: 'Please use a POST request.' });
    }
}
