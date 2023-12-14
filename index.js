const { google } = require('googleapis');

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.readGmail = async (req, res) => {
    const oauth2Client = new google.auth.OAuth2(
        YOUR_CLIENT_ID,
        YOUR_CLIENT_SECRET,
        YOUR_REDIRECT_URI
    );

    // Assuming you have the access token
    oauth2Client.setCredentials({
        access_token: YOUR_ACCESS_TOKEN,
        refresh_token: YOUR_REFRESH_TOKEN
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread',
        });

        const messages = response.data.messages;
        if (!messages || messages.length == 0) {
            res.send('No new emails found.');
            return;
        }

        // Fetching details of each message
        const emails = await Promise.all(messages.map(async (message) => {
            const emailDetails = await gmail.users.messages.get({
                userId: 'me',
                id: message.id
            });
            return emailDetails.data.snippet;
        }));

        res.status(200).send(emails);
    } catch (error) {
        console.error('The API returned an error: ' + error);
        res.status(500).send('Error retrieving emails');
    }
};
