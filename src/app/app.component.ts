import { Component, OnInit } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { SalesforceService } from './salesforce.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'Salesforce Mappy';
  csvFile = undefined;
  csvData = undefined;
  salesforceContacts = undefined;

  constructor (private papa: Papa, private sfService: SalesforceService) {} 
  ngOnInit() {}

  public uploadCSVFileAction() {
    // @ts-ignore (files isn't recognized)
    this.csvFile = document.getElementById("csvInputFileElement").files[0];
    if (this.csvFile == null) return;
    let csvData = [];
    
    console.log('Uploading File...');

    // Stream big file in worker thread
    this.papa.parse(this.csvFile, {
      download: true,
	    complete: function(results) {
        results.data.forEach(aResult => {
          csvData.push(aResult);
        })
        console.log("Row:", results.data);
      }
    });
    this.csvData = csvData;
  }

  public retrieveSalesforceContacts() {

    this.sfService.doSalesforceRestCallout('SELECT+Name+,Email+FROM+Contact+LIMIT+5').then(results => {
      this.salesforceContacts = JSON.parse(results)["records"];
      this.salesforceContacts.forEach(aContact => {
        console.log(aContact);
      })
    });
    
  }

  // Step 1: Accept/Get the uploaded file 

  // Step 2: Retrieve Data from Salesforce for Comparison 

  // Step 3: ???

  // Step 4: Profit
}
