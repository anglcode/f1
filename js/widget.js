// F1 Podium Lock Screen Widget
// ================================


const url = "https://f1access.adlaird6471.workers.dev/podium";


//Get data
const request = new Request(url);
const data = await request.loadJSON();


//Create widget
const widget = new ListWidget();

widget.setPadding(6, 8, 6, 8);

//Background
widget.backgroundColor = new Color("#000000");


//Helper for a row
function addRow(position, driver) {
    const row = widget.addStack();

    row.layoutHorizontally();
    row.centerAlignContent();

    // Position
    const positionText = row.addText(position);
    positionText.font = Font.boldSystemFont(12);
    positionText.textColor = Color.white();

    // Space between position and driver
    row.addSpacer(6);

    // Driver
    const driverText = row.addText(driver || "—");
    driverText.font = Font.systemFont(12);
    driverText.textColor = Color.white();
}


//Add podium
addRow("1st:", data["1st"]);

widget.addSpacer(2);

addRow("2nd:", data["2nd"]);

widget.addSpacer(2);

addRow("3rd:", data["3rd"]);



widget.refreshAfterDate = new Date(Date.now() + 60 * 1000);



Script.setWidget(widget);
Script.complete();