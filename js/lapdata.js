import {fetchData , timcon , timehelp, cachecheck, numtodriver, drivertocolor} from './f1data.js'; 
const laps = "https://api.openf1.org/v1/laps?session_key=latest&lap_number>=1"
const driverNumbers = [1, 3, 5, 6, 10, 11, 12, 14, 16, 18, 23, 27, 30, 31, 41, 43, 44, 55, 63, 77, 81, 87]
export async function gettimes(){
    if(cachecheck()|| !localStorage.getItem("bestlaps")){
    let bestlap={};
    for(const driver of driverNumbers){
       const data = await fetchData(`https://api.openf1.org/v1/laps?session_key=latest&lap_number>=1&driver_number=${driver}`);
            if (data) {
                let min = null;
                let lapb = null;
                for (const lap of data) {
                if(lap.lap_duration != null){
                    if(lap.lap_duration < min || min === null){
                        min = lap.lap_duration;
                        lapb = lap.lap_number;
                    }
                }
            }
                bestlap[driver] = {min,lapb};
               localStorage.setItem(`${driver}.laps`,JSON.stringify(data));
               await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 1 second before the next request
            }
        }
        localStorage.setItem("bestlaps",JSON.stringify(bestlap));
        return true;
    }
    return false;
    }

export async function setlaps(){
    if(!localStorage.getItem("bestlaps")){
       const loading = document.getElementById('loader');
        loading.textContent = 'Loading...'; // Show the loading indicator
        await gettimes();
        loading.style.display = 'none'; // Hide the loading indicator
    }
    const bestlaps = JSON.parse(localStorage.getItem("bestlaps"));
    if (bestlaps) {
        const table = document.querySelector('#times');
        const sorted = Object.entries(bestlaps).sort((a, b) => a[1].min - b[1].min);
        const bestlap = sorted[0][1].min;
        const rows = await Promise.all(
            sorted.map(async (entry, index) => {
                const [driverNumber, lapTime] = entry;
                const color = drivertocolor(driverNumber);
                const name = await numtodriver(driverNumber);
                return `<tr style="color: ${color} !important;"><td>${name}</td><td>${index + 1}</td><td>${timehelp(lapTime.min)}s</td><td>${lapTime.lapb}</td><td>${timehelp( lapTime.min- bestlap)}s</td></tr>`;
            })
        );
        
        table.innerHTML += rows.join('');
    }
}



    

