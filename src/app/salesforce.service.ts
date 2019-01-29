/**
 * Salesforce Service
 * ------------------------------------------------
 * Contains methods for generating a client access token and making REST API calls to Salesforce
 * 
 */
import { Injectable } from '@angular/core';
import { SimplekeysService } from './simplekeys.service';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable, empty, merge, onErrorResumeNext } from 'rxjs';
import { expand } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SalesforceService {

  public accessToken;
  //public salesforceRestEndpoint = 'https://domaindemo-dev-ed.my.salesforce.com/services/data/v43.0/query/?q=';
  public salesforceRestEndpoint = 'https://cs47.salesforce.com/services/data/v43.0/query/?q=';

  constructor(private keys: SimplekeysService, private httpSvc: HttpClient) { }

  /* Do a special GET request with the salesforce access token */
  public doSalesforceRestCallout(endpoint) {

    // First get the access token 
    let result = this.getSFAccessToken().then(accessTokenResponse => {

      this.accessToken = JSON.parse(accessTokenResponse)["access_token"];

      // After retrieving access token (either previously stored, or newly created) make the REST callout
      let salesforceRESTPromise = fetch(endpoint, {  // Global variable endpoint
        method: "GET",
        headers : {
            'Content-Type': 'application/json',
            'Charset' : 'UTF-8',
            'Accept' : 'application/json',
            'Authorization' : `Bearer ${this.accessToken}`
        }
      }).then(fetchedResponse => {
        console.log(fetchedResponse);
        return fetchedResponse.text();
      }).catch((err) => {
        console.log('Error');
        console.log(err);
      });

      return salesforceRESTPromise;
    });
    
    return result;

  }

  // Returns an Observable! 
  public observableCallout(salesforceRestEndpoint: string, accessToken: string) {
    
    // Configure the HTTP Headers
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Charset' : 'UTF-8',
        'Accept' : 'application/json',
        'Authorization' : `Bearer ${accessToken}`
      })
    };

    // Make the XML Http Request
    return this.httpSvc.get(salesforceRestEndpoint, httpOptions);
  }

  

  

    /* UTILITY: Retrieve and return a Salesforce access token (needed for API REST queries) */
    public getSFAccessToken() {
  
        let clientId = this.keys.getClientId();
        let clientSecret = this.keys.getClientSecret();
        //let tokenURL = 'https://domaindemo-dev-ed.my.salesforce.com/services/oauth2/token';
        let tokenURL = 'https://test.salesforce.com/services/oauth2/token';
        let username = this.keys.getSalesforceUsername();
        let password = this.keys.getSalesforcePassword();
        let securityToken = this.keys.getSalesforceSecurityToken();
  
        let requestBody = `grant_type=password&client_id=${clientId}&client_secret=${clientSecret}&username=${username}&password=${password}${securityToken}`;
  
        let httpResponsePromise = fetch(tokenURL, {
            redirect: 'follow',
            method: "POST",
            body: requestBody,
            headers : {
            "Content-Type": "application/x-www-form-urlencoded",
            }
        }).then(fetchedResponse => {
            return fetchedResponse.text();
        }).catch((err) => {
          console.log(err);
        });
        this.accessToken = httpResponsePromise;
        
        return this.accessToken;
    }

}