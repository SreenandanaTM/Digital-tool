import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AllApiService {
  serverURL = 'http://10.15.51.152:5002/api'

  constructor(private http: HttpClient) { }
  // login
  loginAPI(body: any) {
    return this.http.post(`${this.serverURL}/test`, body)
  }

  // loginAPI(body: any) {
  //   return this.http.post('http://10.15.51.144:5037/api/auth/login', body)
  // }


  // this api call is for storing data permanantly
  // import Excel
  // importExcelAPI(file:File){
  //   const formData=new FormData();
  //   formData.append('file',file)
  //   return this.http.post(`${this.serverURL}/excel/upload`,formData)
  // }



// upload Excel file
  importExcelAPI(file: File) {
    const formData = new FormData();
    formData.append('file', file)
    return this.http.post(`${this.serverURL}/excel/readdata`, formData)
  }

  // upload pdf file
  // uploadPdfAPI(file:File){
  //   const formData=new FormData();
  //   formData.append('pdf',file)
  //   return this.http.post(`${this.serverURL}/pdf/extract`,formData)
  // }

  uploadPdfAPI(file:File){
    const formData=new FormData();
    formData.append('file',file)
    return this.http.post('http://10.15.51.144:5037/api/files/upload',formData)
    // return this.http.post(`${this.serverURL}/files/upload`,formData)
  }

  // export excel
  // exportExcelAPI(){
  //   return this.http.get(`${this.serverURL}/excel/data`)
  // }
}
