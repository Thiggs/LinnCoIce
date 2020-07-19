//Get inmate list
async function dataGetter(){
  document.getElementById("status").innerHTML = "Retrieving list of all inmates";
    //Get inmate list
    const d = new Date();
    const n = d.getTime();
    const xhReq = new XMLHttpRequest();
    const allInmateURL= 'https://cors-anywhere.herokuapp.com/https://inmatesearch.linncounty.org/Home/GetTableData?_='+n;

    async function makeGetRequest() {
      xhReq.open("GET", allInmateURL, false);
      xhReq.send(null);
      let data = JSON.parse(xhReq.responseText);
      return data.data;
    }
    
    const allInmates= await makeGetRequest();
    document.getElementById("status").innerHTML = "Retrieving Booking Information";
    filterInmates(allInmates);
  };
  
  async function filterInmates(allInmatesList) {
  
    const callPromises = allInmatesList.map(i => {
         const date = new Date();
          const time = date.getTime();
          const xhReq = new XMLHttpRequest();
          const inmateURL = 'https://cors-anywhere.herokuapp.com/https://inmatesearch.linncounty.org/BookingDetails/GetTableData?bookID='+i.BOOK_ID+'&_='+time;
  
            xhReq.open("GET", inmateURL, false);
            xhReq.send(null);
            xhReq.onloadend = function() {
              if(xhReq.status == 404) 
                  throw new Error(url + ' replied 404');
          }
            let response = JSON.parse(xhReq.responseText);
            let thisInmate = {...i, ...response};
            return thisInmate;
          });
  
    const results = await Promise.all(callPromises);
  
    document.getElementById("status").innerHTML = "Filtering Inmates";

    const iceInmates = results.filter(r=>{
      let iceInmate = r.data.some(({CHRGDESC})=>
      CHRGDESC == "HOLD - IMMIGRATION AND CUSTOMS ENFORCEMENT"|| CHRGDESC == "HOLD INS DETAINER");
      return iceInmate;
    })
    .sort((a,b) => (a.BOOK_ID < b.BOOK_ID)? 1 : -1);
    
    console.table(iceInmates);
  
    iceInmates.forEach((d, i) =>{
      console.log("index "+i, " Name: "+d.FULLNAME)
      d.data.forEach(dataObj=>{
        console.table(dataObj);
        });
    });

    let table = document.getElementById("iceMaker");
    let data = Object.keys(iceInmates[0]);
    generateTableHead(table, data);
    generateTable(table, iceInmates);

    iceInmates.forEach((d, i) =>{
      let chargeTitle = document.createElement("p")
      chargeTitle.innerHTML = "index "+i+" Name: "+d.FULLNAME;
 //     chargeTitle.setAttribute("id", d.BOOK_ID.toString());
      document.getElementById("charges").appendChild(chargeTitle);

      d.data.forEach((dataObj, i)=>{
        let tableCreator = document.createElement("table");
   //     tableCreator.setAttribute("id", d.BOOK_ID.toString()+i.toString());
        document.getElementById(d.BOOK_ID.toString()).appendChild(tableCreator);

        let chargeTable = document.getElementById(d.BOOK_ID.toString()+i.toString())
        let charges = Object.keys(dataObj[0]);
        generateTableHead(chargeTable, charges);
        generateTable(chargeTable, dataObj);
        });

  });
};
  
  function generateTableHead(table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
      let th = document.createElement("th");
      let text = document.createTextNode(key);
      th.appendChild(text);
      row.appendChild(th);
    }
  }
  
  function generateTable(table, data) {
    for (let element of data) {
      let row = table.insertRow();
      for (key in element) {
        let cell = row.insertCell();
        let text = document.createTextNode(element[key]);
        cell.appendChild(text);
      }
    }
  }