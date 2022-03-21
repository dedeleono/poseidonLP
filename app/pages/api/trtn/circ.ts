import type { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'serverless-mysql';

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const db = mysql({
    config: {
      host: 'api.shill-city.com',
      port: 3306,
      database: 'trtn_db',
      user: 'shantiesdev',
      password: 'hailhydra'
    }
  });
  try {
    const results = await db.query("SELECT UNIX_TIMESTAMP(timestamp) as time, circ as value FROM trtn_circ GROUP BY hour(timestamp) , day( timestamp )");
    await db.end();
    // Cache 1 hour
    res.setHeader('Cache-Control', 's-maxage=3600');
    // @ts-ignore
    res.status(200).json({ data: results })
  } catch (error:any) {
    console.log(error);
    // @ts-ignore
    res.status(500).json({ error })
  }

}


