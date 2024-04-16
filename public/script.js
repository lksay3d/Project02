document.getElementById('biddingForm').addEventListener('submit', function(event)
{
    event.preventDefault();

    const bid = document.getElementById('bid').value;

    fetch('/bid', {
        method: 'POST',
        headers: 
        {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bid: parseInt(bid) }),
    })

    .then(response => response.json())
    .then(data => {
        document.getElementById('response').textContent = data.message;
        updateAvailability();
    })
    .catch(error => {
        console.log('Error:', error);
        document.getElementById('response').textContent = "Failed to process bid. Please try again.";
    });
});

function updateAvailability() {
    fetch('/availability')

    .then(response => response.json())
    .then(data => {
        document.getElementById('suitesAvailable').textContent = data.suites;
        document.getElementById('deluxeAvailable').textContent = data.deluxe;
        document.getElementById('standardAvailable').textContent = data.standard;
    })
    .catch(error => {
        console.log('Error fetching availability:', error);
    });
}
