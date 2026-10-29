# Property Analyzer — New York Real Estate

A mobile-friendly prototype for researching New York residential properties.

## What's included
- `index.html` — property address search and report interface.
- `api/property.js` — server-side Vercel function that requests property records, value estimates, and long-term rent estimates from RentCast.
- The RentCast key is read from the server environment; never put it in the browser code or commit it to this repository.

## Next step: deploy with Vercel
1. Open Vercel and choose **Add New → Project**.
2. Import the GitHub repository `Mynewhome541/property-analyzer`.
3. In the Vercel project, open **Settings → Environment Variables**.
4. Add an environment variable named `RENTCAST_API_KEY` and paste your private RentCast API key as its value.
5. Deploy or redeploy the project.
6. Open the live site and test with a full New York address. If it fails, check Vercel function logs and your RentCast dashboard.

The website is not live just because the files are in GitHub. It must be deployed. Opening `index.html` directly on a phone will not run the backend API.

## Important limits
- The first version is configured for New York State addresses.
- Each lookup can make up to three provider requests. Check the current RentCast plan, request allowance, billing, and licensing terms before testing.
- Data fields may be missing for some properties. Estimates are not appraisals or guarantees.
- Insurance, flood risk, repairs, financing, and a complete operating-expense analysis are not connected yet. Insurance should be handled as an estimate or quote workflow.
