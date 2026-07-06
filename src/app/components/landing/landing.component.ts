import { Component, inject, signal } from '@angular/core';
import { AllApiService } from '../../service/all-api.service';
import { switchMap } from 'rxjs';
import { KENDO_GRID } from '@progress/kendo-angular-grid';


@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [KENDO_GRID],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  api = inject(AllApiService)

  selectedFile!: File

  excelData = signal<any[]>([]);
  allEmployees=signal<any[]>([])

  
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log(this.selectedFile);
      this.uploadFile()

    }

  }



// upload files temporarily
  uploadFile() {
    if (this.selectedFile) {
      this.api.importExcelAPI(this.selectedFile).subscribe({
        next: (res: any) => {
          console.log(res);
          this.allEmployees.set(res)
          this.excelData.set(res)

        },
        error: (err) => {
          console.log(err);

        }
      });

    }
  }
   // search function
search(event:any){
  const searchText=event.target.value.toLowerCase();
  const filteredData=this.allEmployees().filter((item:any)=>
    item.Name.toLowerCase().includes(searchText)
  )
  this.excelData.set(filteredData)
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



  
}
