import { Component, inject, signal, ViewChild } from '@angular/core';
import { AllApiService } from '../../service/all-api.service';
import { switchMap } from 'rxjs';
import { AddEvent, CreateFormGroupArgs, GridComponent, KENDO_GRID, KENDO_GRID_EXCEL_EXPORT, KENDO_GRID_PDF_EXPORT, SaveEvent } from '@progress/kendo-angular-grid';
import { SVGIcon, filePdfIcon, fileExcelIcon } from "@progress/kendo-svg-icons";
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';



@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [KENDO_GRID, KENDO_GRID_PDF_EXPORT, KENDO_GRID_EXCEL_EXPORT],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
// get the grid reference
@ViewChild('grid')
grid!:GridComponent

isExporting=false

  api = inject(AllApiService)
  fb = inject(FormBuilder)


  selectedFile!: File
  // defining pdf or excel file variable
  uploadType = '';
  // store pdf text data
  pdfContent:string='';

  excelData = signal<any[]>([]);
  allEmployees = signal<any[]>([])
  // variable for setting the grid view when searching anything that not in the gird
  showGrid = false;
  public filePdfIcon: SVGIcon = filePdfIcon;
  public fileExcelIcon: SVGIcon = fileExcelIcon;



  public createFormGroup = (args: CreateFormGroupArgs): FormGroup => {
    const item = args.isNew ? {} : args.dataItem;

    return this.fb.group({
      Name: [item.Name, [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      Email: [item.Email, [Validators.required, Validators.email]],
      Department: [item.Department, [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      Designation: [item.Designation, [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      salary: [Number(item.salary), [Validators.required, Validators.pattern('[0-9]*')]],
      Location: [item.Location, [Validators.required, Validators.pattern('[a-zA-Z]*')]],
      Status: [item.Status]
    });
  }


  // selection of the excel file
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log(this.selectedFile);
      if (this.uploadType === 'excel') {
        this.uploadFile();
      } else {
        this.uploadPdf();
      }
    }

  }

  // pdf upload
  uploadPdf() {
    if (this.selectedFile) {
      this.api.uploadPdfAPI(this.selectedFile).subscribe({
        next: (res: any) => {
          this.pdfContent=res.text;
          console.log(res);
        },
        error: (err) => {
          console.log(err);
        }
      })
    }
  }

  // Hide the action column only during export
  exportPDF(){
    this.isExporting=true;
    setTimeout(()=>{
      this.grid.saveAsPDF();
      setTimeout(()=>{
        this.isExporting=false;
      });
    });

  } 



  // upload files temporarily
  uploadFile() {
    if (this.selectedFile) {
      this.api.importExcelAPI(this.selectedFile).subscribe({
        next: (res: any) => {
          console.log(res);
          const validateData = this.validateMandatoryFields(res)
          this.allEmployees.set(validateData)
          this.excelData.set(validateData)
          this.showGrid = true

        },
        error: (err) => {
          console.log(err);

        }
      });

    }
  }
  // search function
  search(event: any) {
    const searchText = event.target.value.toLowerCase();
    const filteredData = this.allEmployees().filter((item: any) =>
      item.Name.toLowerCase().includes(searchText)
    )
    this.excelData.set(filteredData)
  }

  // validate mandatory fields in the grid if it is empty
  validateMandatoryFields(data: any[]) {
    return data.map(item => ({
      ...item,
      nameError: !/^[A-Za-z ]+$/.test(item.Name),
      emailError: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.Email),
      departmentError: !/^[A-Za-z ]+$/.test(item.Department),
      designationError: !/^[A-Za-z ]+$/.test(item.Designation),
      salaryError: !/^\d+(\.\d+)?$/.test(item.salary),
      locationError: !/^[A-Za-z ]+$/.test(item.Location),
      statusError: !/^(completed|Pending|Cancelled|Due)$/i.test(item.Status),
      isInvalid:
        !item.Name ||
        !item.Email ||
        !item.Department ||
        !item.Location ||
        !item.Designation ||
        !item.salary ||
        !item.Status

    }))
  }



  // hightlighting invalid row
  public rowClass = (context: any) => {
    // console.log(context.dataItem.isInvalid);
    return { 'invalid-row': context.dataItem.isInvalid }
  }

  // save the edited data
  saveHandler(event: SaveEvent) {
    const updatedItem = this.validateMandatoryFields([event.formGroup.value])[0];
    this.excelData.update(data => {
      if(event.isNew){
        return [...data,updatedItem]
      }
      data[event.rowIndex] = updatedItem;
      return [...data]
    })
    this.allEmployees.update(data => {
      if(event.isNew){
        return [...data,updatedItem]
      }
      data[event.rowIndex] = updatedItem;
      return [...data]
    })
  }

  // add the data
  addHandler(event:AddEvent){
    event.sender.addRow({})
  }



  // upload excel data and  get excel data using switchmap
  // uploadFile(){
  //   if(this.selectedFile){
  //     this.api.importExcelAPI(this.selectedFile).pipe(
  //     switchMap((res:any)=>{
  //       alert(res.message)
  //       return this.api.exportExcelAPI();
  //     })
  //   ).subscribe({
  //     next:(res:any)=>{
  //       console.log(res);
  //       this.excelData.set(res)

  //     },
  //     error:(err)=>{
  //       console.log(err);

  //     }
  //   });
  //   }
  //   else{
  //      alert('Please select a file')
  //   }

  // }

  public allData = (): ExcelExportData => {
    return {
      data: this.allEmployees()
    }
  }




}
