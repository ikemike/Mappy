import { Component, OnInit } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { SalesforceService } from './salesforce.service';
import { Observable, empty, merge, onErrorResumeNext } from 'rxjs';
import { expand } from 'rxjs/operators';


interface CSVHeader {
  selected: boolean;
  fieldName: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'Salesforce Mappy';
  csvData = undefined;
  csvHeaderFields: CSVHeader[];
  salesforceContacts = undefined;

  constructor (private papa: Papa, private sfService: SalesforceService) {} 
  ngOnInit() {}

  public uploadCSVFileAction() {
    // @ts-ignore (files isn't recognized)
    let csvFile = document.getElementById("csvInputFileElement").files[0];
    if (csvFile == null) return;

    let csvData = [];
    this.csvHeaderFields = this.getCSVHeaderRow(csvFile);

    this.papa.parse(csvFile, {
      download: true,
      header: true,
	    complete: function(results) {

        results.data.forEach(aResult => {
          csvData.push(aResult);
        })
        console.log("Row:", results.data);
      }
    });
    this.csvData = csvData;
  }

  // Get each header row in the CSV document 
  public getCSVHeaderRow(csvFile) {
    let csvHeaderFields = [];
    this.papa.parse(csvFile, {
      download: true,
	    complete: results => {
        results.data[0].forEach(aColumnHeader => {
          csvHeaderFields.push({ selected: false, fieldName: aColumnHeader });
        })
      }
    });
    return csvHeaderFields;
  }

  // TODO: Make this recurring based on 'nextRecordsURL'
  public retrieveSalesforceContacts() {
    this.salesforceContacts = [];
    let baseurl = 'https://cs47.salesforce.com/services/data/v43.0/query/?q=';
    let query = 'SELECT+Name+,Email+FROM+Contact+LIMIT+3000';
    let nextRecordsUrl = '';


    this.sfService.doSalesforceRestCallout(baseurl + query).then(results => {
      //let records = JSON.parse(results)["records"];
      //records.forEach(aRecord => { this.salesforceContacts.push(aRecord)})


      let nextRecordUrl = JSON.parse(results)["nextRecordsUrl"];


      console.log(this.salesforceContacts.length + ' Contacts Retrieved');
      console.log(nextRecordUrl);
    });

    // Version 2.0 Attempt to use the "nextRecordsUrl" property
  }

  public doObservableGetCallout() {
    let baseurl = 'https://cs47.salesforce.com/services/data/v43.0/query/?q=';
    let base = 'https://cs47.salesforce.com/';

    let query = 'SELECT+Name+,Email+FROM+Contact';

    return this.sfService.observableCallout(baseurl + query)
      .pipe(expand(
        // Expand will keep adding observables until empty - 
        // in this case, using the 'next' property of the response
        (data, i) => (<any> data).nextRecordsUrl ? this.sfService.observableCallout(base+(<any> data).nextRecordsUrl) : empty()
      ));
  }

  public retrieveContactsViaObservable() {
    this.doObservableGetCallout().subscribe(
      data => {
        let records = data["records"];
        records.forEach(aRecord => { this.salesforceContacts.push(aRecord)})
        console.log(this.salesforceContacts.length);
      }
    )
  }

  // UI interaction for showing which CSV fields are currently selected
  public selectCSVColumn(selectedField: CSVHeader) {
    selectedField.selected = selectedField.selected ? false : true;
  }

  // Read-Only property for showing which CSV fields are currently selected 
  get selectedColumns() {
    return this.csvHeaderFields.filter(aField => {
      return aField.selected == true;
    })
  }

  //Method uses the provided CSV document to attempt to find duplicates 
  public findContacts() {
    let matchedRecords = [];

    for (let i = 0; i < this.salesforceContacts.length; i++) {
      let sfContact = this.salesforceContacts[i];
      for (let j = 0; j < this.csvData.length; j++) {
        let csvContact = this.csvData[j];
        if (sfContact.Email === csvContact.Email && csvContact.Email != '') {
          matchedRecords.push(sfContact);
        }
      }
    }

    
    
    console.log(matchedRecords);

  }

}
