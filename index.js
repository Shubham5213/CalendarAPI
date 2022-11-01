const express = require('express');
const dotenv = require('dotenv');
const { google } = require('googleapis');


dotenv.config('.env');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let CLIENT;

app.get('/rest/v1/calendar/init', (req, res) => {
	const oauth2Client = new google.auth.OAuth2(process.env.CLIENTID, process.env.CLIENTSECRET, `http://localhost:3000/rest/v1/calendar/redirect`);
	const url = oauth2Client.generateAuthUrl({ scope: 'https://www.googleapis.com/auth/calendar' });
	CLIENT = oauth2Client;
	res.redirect(url);
});

app.get('/rest/v1/calendar/redirect', (req, res) => {
	CLIENT.getToken(req.query.code).then(async ({ tokens }) => {
		CLIENT.setCredentials(tokens);
		try {
			const data = await getCalendarData();
			res.json(data);
		} catch (e) {
			res.send(e.message);
			console.error(e);
		}
	});
})

async function getCalendarData() {
	if (!CLIENT) throw new Error('Not logged in');
	const calendar = google.calendar({ version: 'v3', auth: CLIENT });
	const result = await calendar.events.list({
		calendarId: 'primary',
		timeMin: new Date().toISOString(),
		singleEvents: true,
		orderBy: 'startTime',
	});
	return result.data;
}

const server = app.listen(3000, () => {
	console.log('Site is up');
});