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
  salesforceRecords = [];
  matchCollection = [];
  

  constructor (private papa: Papa, private sfService: SalesforceService) {} 
  ngOnInit() {
    this.retrieveSalesforceRecords();
  }
  

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

  public retrieveSalesforceRecords() {
    let serviceUrl = 'https://cs47.salesforce.com/services/data/v43.0/query/?q=';
    let query = 'SELECT+Name+,+Capital_IQ_ID__c+FROM+Account';
    this.salesforceRecords = [];

    this.sfService.getSFAccessToken().then(token => {
      this.doObservableGetCallout(JSON.parse(token)["access_token"], serviceUrl + query).subscribe(
        data => {
          let records = data["records"];
          records.forEach(aRecord => { this.salesforceRecords.push(aRecord)})
          console.log(this.salesforceRecords.length);
        }
      )
    });
  }

  public doObservableGetCallout(accessToken: string, restEndpoint: string) {
    let baseUrl = restEndpoint.substring(0, restEndpoint.indexOf(".com") + 5);
    return this.sfService.observableCallout(restEndpoint, accessToken)
      .pipe(expand(
        // Expand will keep adding observables until empty - in this case, using the 'next' property of the response
        (data, i) => (<any> data).nextRecordsUrl ? this.sfService.observableCallout(baseUrl+(<any> data).nextRecordsUrl, accessToken) : empty()
      ));
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

  // Basic method compares CSV and SFDC data by selected columns
  public searchForMatches() {
    let matchObjectExample = { "csvRecord": undefined, "salesforceRecords": [] };
    let matchCollection = []

    let columnMatching = 'Account Name';
    let sfColumnName = 'Name';

    /*
    let matchedCSVRecords = this.csvData.filter(aCSVRecord => {
      let matchRecord = { "csvRecord": aCSVRecord, "salesforceRecords": [] };
      return this.salesforceRecords.some(aSFRecord => {
        if (aCSVRecord[columnMatching] === aSFRecord[sfColumnName]) matchRecord.salesforceRecords.push(aSFRecord);
        return aCSVRecord[columnMatching] === aSFRecord[sfColumnName];
      })
    })
    */

    for (let i = 0; i < this.csvData.length; i++) {
      let matchRecord = { "csvRecord": this.csvData[i], "salesforceRecords": [] };
      for (let j = 0; j < this.salesforceRecords.length; j++) {
        if (this.csvData[i][columnMatching] == this.salesforceRecords[j][sfColumnName]) {
          matchRecord.salesforceRecords.push(this.salesforceRecords[j]);
        }
      }
      matchCollection.push(matchRecord);
    }
    console.log(matchCollection);


    let matchedSFRecords = this.salesforceRecords.filter(aSFRecord => {
      return this.csvData.some(aCSVRecord => {
        return aCSVRecord[columnMatching] === aSFRecord[sfColumnName];
      })
    })  
    //console.log(matchedCSVRecords);
    console.log(matchedSFRecords);

    this.matchCollection = matchCollection;
  }



  //Method uses the provided CSV document to attempt to find duplicates 
  public findContacts() {
    
    let matchedRecords = [];
    let selectedFilterColumns = this.selectedColumns;

    console.log('Selected Columns Include: ' + selectedFilterColumns);
    
    let matchedContacts = this.salesforceRecords.filter(aSFContact => {
      for (let i = 0; i < this.csvData.length; i++) {
        let excelContact = this.csvData[i];
        for (let j = 0; j < selectedFilterColumns.length; j++) {
          return excelContact[j] === aSFContact[j];
        }
      }
    })
      /*
      return this.csvData.filter(anExcelContact => {
        return anExcelContact.Email === aSFContact.Email;
        /*
        return selectedFilterColumns.forEach(aColumn => {
          return anExcelContact(aColumn) === aSFContact(aColumn);
        })
        
      })
    })
    */
    console.log(matchedContacts);
    for (let i = 0; i < this.salesforceRecords.length; i++) {
      let sfContact = this.salesforceRecords[i];
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
