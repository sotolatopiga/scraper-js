// Scrape phai sinh 1s
function grabVn30List() {
    data = grabData("/html/body/div[2]/div/div/div[2]/div/div/table/tbody");
    const lst = data.map(x => x[0]);
    return lst;
}

function grabTodayPS() {
    const data = grabData("/html/body/div[2]/div/div/div[2]/div/div/table/tbody/tr[2]/td/div/div[3]/table/tbody")
    console.save(data, FN_GRAB_TODAY );
}

function Arr(x) { return Array.prototype.slice.call(x.children)}

function getTableBody(st) {return Arr($x(st)[0])}

function parseRows(body) {return body.map(row => Arr(row).map(cell => cell.textContent))}

function grabData(s) {return parseRows(getTableBody(s))}

(function(console){

    console.save = function(data, filename){

        if(!data) {
            console.error('Console.save: No data')
            return;
        }

        if(!filename) filename = 'console.json'

        if(typeof data === "object"){
            data = JSON.stringify(data, undefined, 4)
        }

        var blob = new Blob([data], {type: 'text/json'}),
            e    = document.createEvent('MouseEvents'),
            a    = document.createElement('a')

        a.download = filename
        a.href = window.URL.createObjectURL(blob)
        a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        a.dispatchEvent(e)
    }
})(console)

// showChart("ACB")
function pullDataFromChart() {
    // console.log(Arr(document.querySelector("#historyOrder")));
    return parseRows(Arr(document.querySelector("#historyOrder")))
}

function pullRandomData () {
    showChart(rd())
    setTimeout(function(){
        pullDataFromChart()
    }, CHART_DELAY);
}

function report() {
    console.log(`The dictionary has ${Object.keys(dataDic).length} entries. The last entry has ${dataDic[Object.keys(dataDic)[Object.keys(dataDic).length -1]].length} data points`)
}

function pullData() {
    const stock = vn30List[count]
    showChart(stock)
    setTimeout(function() {
        const data = pullDataFromChart()
        dataDic[stock] = data
        report()

    }, CHART_DELAY);

    count = next(count)
}
let rd = () => vn30List[Math.floor(Math.random() * vn30List.length)]    // Randomize a Mã chứng khoán

function saveit() {
    console.save(dataDic, `HOSE-${start}-${count}-${FN_SAVEIT}`)
}

function grabHoseTable() {
    return  Array.prototype.slice.call(document.querySelector("#sortable-banggia").children)
        .map(x => Array.prototype.slice.call(x.children).map(x => x.textContent))
}

function grabps1() {

    return  [Array.prototype.slice.call(document.querySelector("#tbodyPhaisinhContent > tr.detail > td > div > div.center-panel > div > table:nth-child(1)").children)
        .map(x => Array.prototype.slice.call(x.children).map(x => x.textContent)),Array.prototype.slice.call(document.querySelector("#tbodyPhaisinhContent > tr.detail > td > div > div.center-panel > div > table:nth-child(2)").children)
        .map(x => Array.prototype.slice.call(x.children).map(x => x.textContent)) ]
}
function next(count) { return (count+1) % vn30List.length}

var NOW = () => document.querySelector("#main-wrapper > footer > span").innerText.replaceAll(":", "_")

function scrapePs() {
    console.save(grabps1(), FN_SCRAPE + NOW() + ".json")
}

function stop() {
    clearInterval(myInterval)
}

FN_SCRAPE = "PhaiSinhATC_26_10_2020"
FN_GRAB_TODAY = "VN30F2010_2020_10_26"
FN_SAVE_IT = "2020_10_26"
myInterval = setInterval(scrapePs, 2000)