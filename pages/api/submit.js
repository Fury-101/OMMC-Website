const fs = require("fs")

export default function handler(req, res) {
    if (req.method === 'POST') {
        const data = req.body;

        const curans = JSON.parse(fs.readFileSync(`../tests/${data.id}_ans.json`, {
            encoding: 'utf8',
            flag: 'r'
        }))

            
        fs.writeFileSync(`../tests/${data.id}_ans.json`, JSON.stringify([...curans, {teamInfo: data.teamInfo, answers: data.answers, ...(data.time ? {time: data.time} : {})}]))
        res.status(200).send({ answers: data.answers })
    } else {
        res.status(405).send({ message: 'Please use a POST request.' });
    }
}
