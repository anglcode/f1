const fs = require('fs');
const driverNumbers = [1, 3, 5, 6, 10, 11, 12, 14, 16, 18, 23, 27, 30, 31, 41, 43, 44, 55, 63, 77, 81, 87]

const driverdata = JSON.parse(fs.readFileSync('./driverdata.json', 'utf-8'));

function getcolor(num) {
    const driver = driverdata.find(driver => driver.driver_number === num);
    if (driver) {
        return {driver_number: num, driver_colour: `#${driver.team_colour}`};
    }
}

function writetofile(data,filepath){
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

function run(){
    const colours = driverNumbers.map(getcolor).filter(Boolean);
    writetofile(colours, './drivercolour.json');
}
run();