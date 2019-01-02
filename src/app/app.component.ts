import { Component, OnInit } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { SalesforceService } from './salesforce.service';


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
    let csvHeaderFields = [];

    console.log('Uploading File...');

    this.papa.parse(csvFile, {
      download: true,
	    complete: function(results) {

        // Save CSV Header Information
        results.data[0].forEach(aColumnHeader => {
          csvHeaderFields.push({selected: false, fieldName: aColumnHeader});
        })

        results.data.forEach(aResult => {
          csvData.push(aResult);
        })
        console.log("Row:", results.data);
      }
    });
    this.csvData = csvData;
    this.csvHeaderFields = csvHeaderFields;
  }

  public retrieveSalesforceContacts() {

    this.sfService.doSalesforceRestCallout('SELECT+Name+,Email+FROM+Contact+LIMIT+5').then(results => {
      this.salesforceContacts = JSON.parse(results)["records"];
      this.salesforceContacts.forEach(aContact => {
        console.log(aContact);
      })
    });
    
  }

  public selectCSVColumn(selectedField: CSVHeader) {
    selectedField.selected = selectedField.selected ? false : true;
  }

  get selectedColumns() {
    return this.csvHeaderFields.filter(aField => {
      return aField.selected == true;
    })
  }

}
