function grabVn30List() {
    data = grabData("/html/body/div[2]/div/div/div[2]/div/div/table/tbody");
    const lst = data.map(x => x[0]);
    return lst;
}

function grabTodayPS() {
    const data = grabData("/html/body/div[2]/div/div/div[2]/div/div/table/tbody/tr[2]/td/div/div[3]/table/tbody")
    console.save(data, `VN30F2011_${FN_GRAB_TODAY}`);
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

function today() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var minute = today.getMinutes()
    var second = today.getSeconds()
    var hour = today.getHours()
    const f = x => x < 10 ? "0"+x : ""+x
    return {'day':dd,'month':mm,'year':yyyy,'hour':hour, 'minute':minute,'second':second,'stamp':today.getTime(),
        'date':yyyy+"_"+f(mm)+"_"+f(dd), 'time':f(hour)+"_"+f(minute)+"_"+f(second),
        "datetime": yyyy+"_"+f(mm)+"_"+f(dd) +"_" + f(hour)+"_"+f(minute)+"_"+f(second) }
}

function today() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var minute = today.getMinutes()
    var second = today.getSeconds()
    var hour = today.getHours()
    const f = x => x < 10 ? "0"+x : ""+x
    return {'day':dd,'month':mm,'year':yyyy,'hour':hour, 'minute':minute,'second':second,'stamp':today.getTime(),
        'date':yyyy+"_"+f(mm)+"_"+f(dd), 'time':f(hour)+"_"+f(minute)+"_"+f(second),
        "datetime": yyyy+"_"+f(mm)+"_"+f(dd) +"_" + f(hour)+"_"+f(minute)+"_"+f(second) }
}


function NOW() {
    return today()['datetime']
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
    console.save(dataDic, `HOSE-${start}-${count}-${FN_SAVE_IT}`)
}

function grabHoseTable() {
    return  Array.prototype.slice.call(document.querySelector("#sortable-banggia").children)
        .map(x => Array.prototype.slice.call(x.children).map(x => x.textContent))
}

function next(count) { return (count+1) % vn30List.length}


function calculatePressure() {
    data = grabHoseTable()
    var i = 0
    r = data[i]
    var calculateBuyRow = r => (parseFloat(r[4])*parseInt(r[5].replace(",", ""))+
        parseFloat(r[6])*parseInt(r[7].replace(",", ""))+
        parseFloat(r[8])*parseInt(r[9].replace(",", ""))) /100000

    var calculateSellRow = r => (parseFloat(r[13])*parseInt(r[14].replace(",", "")) +
        parseFloat(r[15])*parseInt(r[16].replace(",", "")) +
        parseFloat(r[17])*parseInt(r[18].replace(",", "")) )  /100000

    var buyTotal = data.map(calculateBuyRow).map(a => a || 0).reduce((a, b) => a + b, 0)
    var sellTotal = data.map(calculateSellRow).map(a => a || 0).reduce((a, b) => a + b, 0)
    return {"buyPressure": buyTotal, "sellPressure": sellTotal}
}


function scrapeHose() {
    const data = {"time":today(), "data": grabHoseTable()}
    // console.save(data, FN_SCRAPE + "_" + NOW() + ".json")
    fetch('http://127.0.0.1:'+ FLASK_PORT +'//api/hose-snapshot-inbound', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    })
        .then(res => res.json())
        .then(console.log)
}

function scrapeAWS() {
    const data = {"time":today(), "data": grabHoseTable()}
    console.log(data["time"])
}


function grabKhopLenhPhaiSinh() {
    const arr = Array.prototype.slice.call(document.querySelector("#historyOrder > tbody").children)
    return arr.map(r => Array.prototype.slice.call(r.children).map(x => x.innerText))

}



function fetchHoseIndicators() {
    fetch('http://localhost:' + FLASK_PORT + '/api/hose-indicators-outound')
        .then(res => res.json())
        .then(res => console.log(res))}
// myRequestInterval = setInterval(fetchHoseIndicators, 3000); fetchHoseIndicators()

function fetchPsOhcl() {
    fetch('http://localhost:' + FLASK_PORT + '/api/ps-ohlc-outbound')
        .then(res => res.json())
        .then(res => console.log(res))}
// myRequestInterval = setInterval(fetchPsOhcl, 3000); fetchPsOhcl()

var count = 0
function scrapeBuySell() {
    o = calculatePressure()
    // console.save(o, FN1 + NOW() + ".json")
    console.log(o)
    if (count % STEP_SAVE === 0) {
        count = count % STEP_SAVE
    }
}


function scrapePhaiSinhSnapShot() {
    data = document.querySelector("#tbodyPhaisinhContent > tr.detail > td > div > div.center-panel > div").innerText
    orders = Array.prototype.slice.call(document.querySelector("#historyOrder > tbody").children).map(r => r.innerText)
    now = today()
    console.log({report:"Posted data to server at " + now["hour"] + ":" + now["minute"] + ":" + now["second"]})
    fetch('http://127.0.0.1:'+ FLASK_PORT +'//api/ps-snapshot-inbound', {
        method: 'POST',
        body: JSON.stringify({time: today(), data: data, orders:orders}),
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    })
        .then(res => res.json())
        .then(console.log)
}


function stop() {
    clearInterval(myInterval)
}

function scrapeHose() {
    const data = {"time":today(), "data": grabHoseTable()}
    // console.save(data, FN_SCRAPE + "_" + NOW() + ".json")
    fetch('http://127.0.0.1:'+ FLASK_PORT +'//api/hose-snapshot-inbound', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    })
        .then(res => res.json())
        .then(console.log)
}

var FLASK_PORT = 5000
var FN_SCRAPE = "HOSE"
var FN_GRAB_TODAY = "VN30F2010_2020_10_30"
var FN_SAVE_IT = "2020_10_30"
var STEP_SAVE = 10; // still unused


// myInterval1 = setInterval(scrapeHose, 2000)                                 // Scrape HOSE SNAPSHOT
myInterval = setInterval(scrapePhaiSinhSnapShot, 2000)                     // Scrape PhaiSinh SNAPSHOT
// myInterval2 = setInterval(fetchHoseIndicators, 3000);fetchHoseIndicators()  // Fetch indicators
// myInterval = setInterval(fetchPsOhcl, 3000); fetchPsOhcl()                          // Fetch OHCL PhaiSinh Data

// myInterval = setInterval(scrapeAWS, 2000)                                    // Scrape HOSE SNAPSHOT
