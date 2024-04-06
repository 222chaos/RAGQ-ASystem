import fs from 'fs';

export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { path } = req.body;

      const data = JSON.parse(fs.readFileSync(path, 'utf-8'));
      console.log(data[1]);
      res.status(200).json({ data });
    } catch (error) {
      console.log('errorr', error);
      console.error('Error reading file:', error);
      res.status(500).json({ error: 'Error reading file' });
    }
  }
}
