import apiFootball from '../src/config/apiFootball.js';

const debugFetch = async () => {
    try {
        console.log('Debugging API call for South Africa...');
        const response = await apiFootball.get('/teams', {
            params: { country: 'South Africa' }
        });

        console.log('Status:', response.status);
        console.log('Headers:', response.headers);
        console.log('Data (response):', JSON.stringify(response.data.response, null, 2));
        console.log('Data (errors):', JSON.stringify(response.data.errors, null, 2));
        console.log('Data (results):', response.data.results);

    } catch (error) {
        console.error('API Error:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
};

debugFetch();
