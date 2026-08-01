
const driverstanding = "https://api.openf1.org/v1/championship_drivers?meeting_key=latest"
const constructorstanding = "https://api.openf1.org/v1/championship_teams?meeting_key=latest"
const landodata = "https://api.openf1.org/v1/championship_drivers?driver_number=1&meeting_key=1286"
const meetingstart = "https://api.openf1.org/v1/meetings?year=2026"
const session = "https://api.openf1.org/v1/sessions?meeting_key=latest"
const oscardata = "https://api.openf1.org/v1/session_result?session_key=11307&driver_number=11"
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
const drivercolors = {
    1: "#F47600",
    3: "#4781D7",
    5: "#F50537",
    6: "#4781D7",
    10: "#00A1E8",
    11: "#909090",
    12: "#00D7B6",
    14: "#229971",
    16: "#ED1131",
    18: "#229971",
    23: "#1868DB",
    27: "#F50537",
    30: "#6C98FF",
    31: "#9C9FA2",
    41: "#6C98FF",
    43: "#00A1E8",
    44: "#ED1131",
    55: "#1868DB",
    63: "#00D7B6",
    77: "#909090",
    81: "#F47600",
    87: "#9C9FA2"
};

//contacts cloudflare worker to access data in safe manner as cloudflare worker secures token and rate limiting
export async function fetchData(apiUrl) {
    try {
        const response = await fetch(`${workerUrl}/fetch?url=${encodeURIComponent(apiUrl)}`);
        if (response.ok) {
            const data = await response.json();
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

// captures most current race weekend data from meeting key which encapsulates event
export async function getsesh(){
    const fetchedData = await fetchData(session);
    let seshdata = [];
    if (fetchedData) {
        for(const data of fetchedData){
            seshdata.push({key: data.session_key, name: data.session_name,});
        }
    }
    return seshdata;
}

//takes all driver data from finish in each event or "session" of the weekend (had to change from set number to variable because of sprint weekends)
export async function gettimes(driv){
    if(cachecheck()|| !localStorage.getItem(`${driv}.session`)){
    const sesh = await getsesh();
    const final = sesh.find(s => s.name === "Race");
    const data = await fetchData(`https://api.openf1.org/v1/session_result?session_key>=${sesh[0].key}&session_key<=${final.key}&driver_number=${driv}`); 
    console.log(data);
    if (data) {
        const table = document.querySelector('#times');
        table.innerHTML = "<tr><th>Session</th><th>Time</th><th>Position</th><th>Gap to Leader</th></tr>";
            const rows = data.map((result) => {
                const cur = sesh.find(s => s.key === result.session_key);
               
                return `<tr><td>${cur.name}</td><td>${timcon(result,result.duration,cur)}</td><td>${result.position}</td><td>${timcon(result,result.gap_to_leader,cur)}</td></tr>`;
            });
            table.innerHTML += rows.join('');
           localStorage.setItem(`${driv}.session`,table.innerHTML);
}
    }else{
        const table = document.querySelector('#times');
        table.innerHTML = localStorage.getItem(`${driv}.session`);
    }

}

//pulls constructor standings and displays after sorting
export async function getcons(){
    if (cachecheck() || !localStorage.getItem('cons')){
    const fetch = await fetchData(constructorstanding);
    const data = cleandata(fetch, "team_name");
        if (data) {
            const table = document.querySelector('#constructor-standings');
            const rows = data.map((team) => {
                const color = teamtocolour(team.team_name);
                return `<tr style="color: ${color} !important;"><td>${team.position_current}</td><td>${team.team_name}</td><td>${team.points_current}</td></tr>`;
            });

            table.innerHTML += rows.join('');
            localStorage.setItem('cons',table.innerHTML);
        }
    }
const table = document.querySelector('#constructor-standings');
table.innerHTML = localStorage.getItem('cons');   
}

//pulls driver standings and builds display after sort
export async function getdriv(){
    if(cachecheck()|| !localStorage.getItem('driv')){
    const fetch = await fetchData(driverstanding);
    const data = cleandata(fetch, "driver_number");
        if (data) {
            const table = document.querySelector('#driver-standings');
            const rows = await Promise.all(data.map(async (driver) => {
                const color = drivertocolor(driver.driver_number);
                const name = await numtodriver(driver.driver_number);
                return `<tr style="color: ${color} !important;"><td>${driver.position_current}</td><td>${name}</td><td>${driver.points_current}</td></tr>`;
            }));

            table.innerHTML += rows.join('');
            localStorage.setItem('driv',table.innerHTML);
        }
    
}
const table = document.querySelector('#driver-standings');
table.innerHTML = localStorage.getItem('driv');
}


//BACKBURNER
//meant to take each driver image from given link but images are grainy and shape weirdly 
async function getimage(nums){
    try {
        const response = await fetch("data/driverdata.json");
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


//not sure if this actually does anything, pretty sure it does (not optimized)
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

//basic helper function to match driver number to driver 
export async function numtodriver(num){
    try {
        const response = await fetch("data/driverdata.json");
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

//both of these are pretty self explanantory
function teamtocolour(team){
    return teamColors[team] || "#00000";  // Return the color if found, otherwise fallback
}
export function drivertocolor(num){
    return drivercolors[num] || "#00000";  // Return the color if found, otherwise fallback
}


//check cache for valid data to reduce api calls and improve data load space 
//TODO: database??
export function cachecheck(){
    const now = new Date();
    if(!localStorage.getItem('date')){
        localStorage.clear();
        localStorage.setItem('date',`${now.getDate()}`+ `${now.getMonth()+1}`);
        return true;
    }
    if(localStorage.getItem('date') !== `${now.getDate()}`+ `${now.getMonth()+1}`){
        localStorage.clear();
        localStorage.setItem('date',`${now.getDate()}`+ `${now.getMonth()+1}`);
        return true;
    }
    return false;
}

//manages different race result states to avoid failures, then passes valid times to timehelp
export function timcon(s,time,cur){

    if((cur.name == "Qualifying" || cur.name == "Sprint Qualifying") && Array.isArray(time)){
        return time.map(t =>{
            if(t == null){
            if(s.dns) return 'DNS';
            if(s.dnf) return 'DNF';
            if(s.dsq) return 'DSQ';
            return '--';
            }
            return timehelp(t);
        }).join(` / `);
    }
    if(cur.name== "Race" || cur.name == "Sprint"){
        if(typeof time === 'string'){
            return time;
        }
    }
   if(s.dns) return 'DNS';
    if(s.dnf) return 'DNF';
    if(s.dsq) return 'DSQ';
    if(time == null) return '--'
    return timehelp(time);
}

//converts bulk seconds timing into pretty HH:MM:SS:MS (i may have had some help with this)
export function timehelp(time){
    const pad = (n,len=2) => String(n).padStart(len,`0`);
    const hours = Math.floor(time/3600);
    const minutes = Math.floor((time/60)%60);
    const seconds = Math.floor(time%60);
    const milliseconds = Math.floor((time%1) *1000);
    let result;
    if(hours>0){
        result = `${hours}:${pad(minutes)}:${pad(seconds)}`;
    } else if(minutes>0){
         result = `${(minutes)}:${pad(seconds)}`;
    }else{
         result = `${seconds}`;
    }
    return `${result}.${pad(milliseconds,3)}`;
}