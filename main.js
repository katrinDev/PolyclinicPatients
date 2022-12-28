let fullName = document.querySelector('#fio');
let adress = document.querySelector('#adress');
let phone = document.querySelector('#phone-number');
let inpatient = document.querySelector('#inpatient');

let arrId = document.querySelectorAll('.id');

let db = openDatabase("Поликлиника", "0.1", "Clinic patients", 200000);

if(!db) alert("Failed to connect to database!");

db.transaction(function(tx){
    	
    tx.executeSql("CREATE TABLE IF NOT EXISTS Пациенты (Имя VARCHAR(30), Адрес VARCHAR(30), Телефон CHAR(15), Стационар TINYINT(1))", 
    [], null, null);

    updateIDs();
});


class Patient{
    static phone2Map = new Map();

    constructor(fullName, adress, phoneNumber, inpatient){
        this.fullName = fullName;
        this.adress = adress;
        this.phoneNumber = phoneNumber;
        this.inpatient = inpatient;
    }

    set fullName(name){
        if(name.length > 5){
            this._fullName = name;
        } else {
            alert("Некорректное имя! Слишком мало символов!");
        }
    }

    get fullName(){
        return this._fullName;
    }

    set adress(adress){
        this._adress = adress;
    }

    get adress(){
        return this._adress;
    }


    get phoneNumber(){
        return this._phoneNumber;
    }

    set phoneNumber(number){
        this._phoneNumber = number;
    }

    get inpatient(){
        return this._inpatient;
    }

    set inpatient(value){
        this._inpatient = value;
    }
}

function saveForm(){
    let boolValue = 0;
    if(inpatient.checked){
        boolValue = 1;
    } 
    let patient = new Patient(fullName.value, adress.value, phone.value, boolValue);
    
    for(let prop in patient){
        console.log(patient[prop]);
    }

    db.transaction((tx) => {
        tx.executeSql("INSERT INTO Пациенты (Имя, Адрес, Телефон, Стационар) VALUES (?, ?, ?, ?)", 
            [patient.fullName, patient.adress, patient.phoneNumber, patient.inpatient]);
    });

    updateIDs();
}

let updateIDs = () =>{
    db.transaction((tx) => {
        tx.executeSql("SELECT rowid FROM Пациенты", [], (tx, results) => {
            for(let id of arrId){
                id.options.length = 0;
                for(let i = 0; i < results.rows.length; i++){
                    let num = results.rows.item(i).rowid;
                    let opt = new Option(num, num)

                    id.append(opt);
                }
            }
            
        });
    });
}

let deleteBtn = document.querySelector('#deleteBtn');

deleteBtn.onclick = () => {
    let id = arrId[0].value;
    if(Patient.phone2Map.has(id)){
        Patient.phone2Map.delete(id);
    }
    db.transaction((tx) => {
        tx.executeSql("DELETE FROM Пациенты WHERE rowid = ?", [id], function(){
            alert(`Данные записи с ID = ${id} успешно удалены`);
        });
    });
    
    updateIDs();
};


let inpatientBtn = document.querySelector("#inp-btn");

inpatientBtn.onclick = () => {
    db.transaction((tx) => {
        tx.executeSql("SELECT Имя FROM Пациенты WHERE Стационар = 1", [], 
        (tx, results) => {
            let set = new Set();
            let str = '';

            for(let i = 0; i < results.rows.length; i++){
                set.add(results.rows.item(i).Имя);
            }

            for(let value of set.values()){
                str += value + ', ';
            }

            alert(`Пациенты на стационарном лечении: ${str}`);
        })
    })
};

let showBtn = document.querySelector("#showBtn");
let tBody = document.querySelector('tbody');
let table = document.querySelector('table');
let fields = document.querySelectorAll('fieldset');
let phone2Th = document.querySelector('#phone2Th');

showBtn.onclick = () => {

    tBody.innerHTML = '';
    let arr = new Array();


    db.transaction((tx) => {
        
        tx.executeSql("SELECT rowid FROM Пациенты", [], (tx, results) => {
            for(let i = 0; i < results.rows.length; i++){
                arr.push(results.rows.item(i).rowid);
            }
        });

        tx.executeSql("SELECT * FROM Пациенты", [], (tx, results) => {
            for(let i = 0; i < results.rows.length; i++){
                let newRow = tBody.insertRow();

                let cellID = newRow.insertCell();
                let textID = document.createTextNode(arr.shift());
                cellID.append(textID);

                let fullRow = results.rows.item(i);
                
                for(let key in fullRow){
                    let cell = newRow.insertCell();
                    let text = document.createTextNode(fullRow[key]);
                    cell.append(text);
                };
            };
        });
    });
    
    table.style.display = 'block';
    table.style.border = '0px';

    for(let i = 0; i < fields.length; i++){
        fields[i].style.marginLeft = '60px';
    }

}

let addPropBtn = document.querySelector('#add-prop-btn');
let phone2 = document.querySelector('#phone2');

addPropBtn.onclick = () => {
    let id = arrId[1].value;
    let phoneValue = phone2.value;

    db.transaction((tx) => {
        tx.executeSql("SELECT Учреждение FROM Пациенты", [], null, function(tx, error){
            tx.executeSql("ALTER TABLE Пациенты ADD Учреждение CHAR(30)", [])
        });
        tx.executeSql("UPDATE Пациенты SET Учреждение=? WHERE rowid=?", [phoneValue, +id]); 
    }); 

    Patient.phone2Map.set(id, phoneValue);
    alert(`Телефон учреждения для записи ${id}: ${Patient.phone2Map.get(id)}`);
}