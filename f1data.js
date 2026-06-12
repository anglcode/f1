const driverstanding = "https://api.openf1.org/v1/championship_drivers?meeting_key=1286"
const constructorstanding = "https://api.openf1.org/v1/championship_teams?meeting_key=1286"
const landodata = "https://api.openf1.org/v1/championship_drivers?driver_number=1&meeting_key=1286"
const meetingstart = "https://api.openf1.org/v1/meetings?year=2026"
const drivdata = "https://api.openf1.org/v1/drivers?driver_number=1&session_key=latest"
const workerUrl = "https://f1access.adlaird6471.workers.dev"
const driverNumbers = [1, 3, 5, 6, 10, 11, 12, 14, 16, 18, 23, 27, 30, 31, 41, 43, 44, 55, 63, 77, 81, 87]
const teamColors = {
    "Mercedes": "#00D7B6",
    "Ferrari": "#ED1131",
    "McLaren": "#F47600",
    "Red Bull Racing": "#4781D7",
    "Alpine": "#00A1E8",
    "Racing Bulls": "#6C98FF",
    "Haas F1 Team": "#9C9FA2",
    "Williams": "#1868DB",
    "Audi": "#F50537",
    "Cadillac": "#909090",
    "Aston Martin": "#229971"
};

// New function - calls your worker with the API URL
async function fetchData(apiUrl) {
    try {
        const response = await fetch(`${workerUrl}/fetch?url=${encodeURIComponent(apiUrl)}`);
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            return data;
        } else {
            console.error("Error fetching data:", response.status, await response.text());
            return null;
        }
    } catch (error) {
        console.error("Network error or other issue:", error);
        return null;
    }
}

async function getcons(){
    const fetchedData = await fetchData(constructorstanding);
    if (fetchedData) {
        const data = cleandata(fetchedData, "team_name");
        if (data) {
            const constructorDiv = document.querySelector('.collum:nth-child(2)');
            constructorDiv.innerHTML = '<h2>Constructor Standings</h2>';
            
            const htmlContent = await Promise.all(data.map(async (team) => {
                const color = teamtocolour(team.team_name);
                return `<p style="color: ${color} !important;">${team.position_current}: ${team.team_name} | Points: ${team.points_current}</p>`;
            }));
            
            constructorDiv.innerHTML += htmlContent.join('');
        }
    }
}

async function getland(){
    await fetchData(landodata);
}

async function getdriv(){
    const fetchedData = await fetchData(driverstanding);
    if (fetchedData) {
        const data = cleandata(fetchedData, "driver_number");
        if (data) {
            const driverDiv = document.querySelector('.collum:nth-child(1)');
            driverDiv.innerHTML = '<h2>Driver Standings</h2>';
            await Promise.all(data.map(async (driver) => {
                const name = await numtodriver(driver.driver_number);
                driverDiv.innerHTML += `<p>${driver.position_current}: ${name} | Points: ${driver.points_current}</p>`;
            }));
        }
    }
}
async function getimage(nums){
    try {
        const response = await fetch("driverdata.json");
        const data = await response.json();
        for (let driver of data) {
            if (driver.driver_number == nums){
                return driver.image_url;
            }
        }
    } catch(error) {
        console.error("Error fetching driver image:", error);
    }
}
function cleandata(data, feild){
    const seen = new Set();
    return data.filter(item => {
        if (seen.has(item[feild])) {
            return false;
        }
        seen.add(item[feild]);
        return true;
    });
}
async function numtodriver(num){
    try {
        const response = await fetch("driverdata.json");
        const data = await response.json();
        for (let driver of data) {
            if (driver.driver_number == num){
                return driver.full_name;
            }
    }
}catch(error) {
    console.error("Error fetching driver name:", error);
}
}
function teamtocolour(team){
    return teamColors[team] || "#00000";  // Return the color if found, otherwise fallback
}



//for later when api request count actually matters, this will prevent the same request from being made multiple times in an hour
function sleepy(hour) {
    if (JSON.parse(localStorage.getItem("hour"))) {
        const tc = JSON.parse(localStorage.getItem("hour"));
        if (tc == hour) {
            return false;
        } else {
            localStorage.setItem("hour", JSON.stringify(hour));
            return true;
        }
    }

}

