import { Component, OnInit } from '@angular/core';
import { Papa } from 'ngx-papaparse';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Salesforce Mappy';
  csvFile = undefined;

  constructor (private papa: Papa) {} 
  ngOnInit() {}

  public uploadCSVFileAction() {
    // @ts-ignore (files isn't recognized)
    this.csvFile = document.getElementById("csvInputFileElement").files[0];
    if (this.csvFile == null) return;
    
    console.log('Uploading File...');

    // Stream big file in worker thread
    this.papa.parse(this.csvFile, {
      download: true,
	    complete: function(results) {
		    console.log("Row:", results.data);
	    }
    });

  }

  // Step 1: Accept/Get the uploaded file 

  // Step 2: Retrieve Data from Salesforce for Comparison 

  // Step 3: ???

  // Step 4: Profit
}
