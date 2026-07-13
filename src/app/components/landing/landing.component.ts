import { Component, inject, signal, ViewChild } from '@angular/core';
import { AllApiService } from '../../service/all-api.service';
import { switchMap } from 'rxjs';
import { AddEvent, CreateFormGroupArgs, GridComponent, KENDO_GRID, KENDO_GRID_EXCEL_EXPORT, KENDO_GRID_PDF_EXPORT, SaveEvent } from '@progress/kendo-angular-grid';
import { SVGIcon, filePdfIcon, fileExcelIcon } from "@progress/kendo-svg-icons";
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';



@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [KENDO_GRID, KENDO_GRID_PDF_EXPORT, KENDO_GRID_EXCEL_EXPORT,ChartsModule,DropDownsModule],
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
  route=inject(Router)


  selectedFile!: File
  // defining pdf or excel file variable
  uploadType = '';
  // store pdf text data
  pdfContent:string='';
  pdfData=signal<any[]>([])
  pdfColumn=signal<any[]>([])


  // role based access
  role='';
  name='';

  excelData = signal<any[]>([]);
  allEmployees = signal<any[]>([])

  // departmentwise bubble
  departments=signal<any[]>([]);
  selectedDepartment=signal('All')

  // for storing bubble chart data
  chartData=signal<any[]>([]);

  // variable for setting the grid view when searching anything that not in the gird
  showGrid = false;
  public filePdfIcon: SVGIcon = filePdfIcon;
  public fileExcelIcon: SVGIcon = fileExcelIcon;


  

  ngOnInit(){
    const user=JSON.parse(sessionStorage.getItem('user')!);
    this.role=user.role
    this.name=user.name
  }



  public createFormGroup = (args: CreateFormGroupArgs): FormGroup => {
    const item = args.isNew ? {} : args.dataItem;

    return this.fb.group({
      Name: [item.Name, [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      Email: [item.Email, [Validators.required, Validators.email]],
      Department: [item.Department, [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      Designation: [item.Designation, [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      salary: [Number(item.Salary), [Validators.required, Validators.pattern('[0-9]*')]],
      Location: [item.Location, [Validators.required, Validators.pattern('[a-zA-Z]*')]],
      Status: [item.Status]
    });
  }

  // Dropdown Change event
  onDepartmentChange(value:string){
    this.selectedDepartment.set(value);
    this.laodchartData()
  }

  // create salary color function
  getDepartmentColor(department:string):string{
   switch(department){
    case 'IT':return '#2196F3';
    case 'HR':return '#4CAF50';
    case 'Finance':return '#FFC107';
    case 'Marketing':return '#FF9800';
    case 'Sales':return '#F44336';
    case 'Admin':return '#9C27B0';
    case 'Support':return '#00BCD4';
    case 'Operations':return '#795548';
    default :return '#9E9E9E'; 
   }
  }

  // function for chart data
  laodchartData(){
    let data=this.allEmployees();

    // filter by department
    if(this.selectedDepartment()!=='All'){
      data=data.filter(item=>item.Department===this.selectedDepartment());
    }
    const bubbleData=data.map(item=>({
      x:Number(item.ID),
      y:Number(item.Salary),
      size:(item.Salary)/1000,
      name:item.Name,
      department:item.Department,
      designation:item.Designation,
      color:this.getDepartmentColor(item.Department)
    }));
    this.chartData.set(bubbleData);
  }


  // selection of the excel file
  onFileSelected(event: Event) {
    console.log("upload file");
    
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
    console.log("inside upload pdf");
    
    if (this.selectedFile) {
      this.api.uploadPdfAPI(this.selectedFile).subscribe({
        next: (res: any) => {
          // this.pdfContent=res.text;

          this.pdfData.set(res.tables)
          console.log(this.pdfData());
          
          if(this.pdfData().length>0){
            this.pdfColumn.set(
              res.tables.map((table:any)=>
                 Object.keys(table.rows[0]??{}).map(key=>({
                field:key,
                title:key
              }))
              )
             
            );
          }
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

          // mapping departments from the data
          const dept=[
            'All',...new Set(validateData.map((x:any)=>x.Department))
          ];
          this.departments.set(dept)
          this.laodchartData();
          console.log(this.chartData());
          
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
      salaryError: !/^\d+(\.\d+)?$/.test(item.Salary),
      locationError: !/^[A-Za-z ]+$/.test(item.Location),
      statusError: !/^(completed|Pending|Cancelled|Due)$/i.test(item.Status),
      isInvalid:
        !item.Name ||
        !item.Email ||
        !item.Department ||
        !item.Location ||
        !item.Designation ||
        !item.Salary ||
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

  // logout 
  logout(){
    sessionStorage.clear()
    this.route.navigateByUrl('/')
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
