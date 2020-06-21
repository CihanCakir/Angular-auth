import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { IProduct } from 'src/app/models/product';
import { Observable, Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ProductService } from 'src/app/services/product.service';
import * as jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {

  product: IProduct;
  // FOrmControl Ürün eklemek için
  insertForm: FormGroup;
  name: FormControl;
  price: FormControl;
  description: FormControl;
  imageUrl: FormControl;

  // Ürün Güncellemk için
  updateForm: FormGroup;
  _name: FormControl;
  _price: FormControl;
  _description: FormControl;
  _imageUrl: FormControl;
  _id: FormControl;


  // Ekleme Modali
  @ViewChild('template') modal: TemplateRef<any>;

  // Güncelleme Modali
  @ViewChild('editTemplate') editmodal: TemplateRef<any>;

  // Modal Özellikleri
  modalMessage: string;
  modalRef: BsModalRef;
  selectedProduct: IProduct;
  products$: Observable<IProduct[]>;
  products: IProduct[] = [];
  userRoleStatus: string;

  // Datatables Özellikleri
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;

  // Token decode etme işlemi
  decodeToken() {
    var token = localStorage.getItem('token');
    var decode = jwt_decode(token);
    console.log(decode);
  }
  constructor(
    private productService: ProductService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private chRef: ChangeDetectorRef,
    private router: Router) { }


  onAddProduct() {
    this.modalRef = this.modalService.show(this.modal);
  }
  // Load The update modal
  onUpdateModal(productEdit: IProduct): void {
    this._id.setValue(productEdit.productId);
    this._name.setValue(productEdit.name);
    this._price.setValue(productEdit.price);
    this._description.setValue(productEdit.description);
    this._imageUrl.setValue(productEdit.imageUrl);

    this.updateForm.setValue({
      'id': this._id.value,
      'name': this._name.value,
      'price': Number(this._price.value),
      'description': this._description.value,
      'imageUrl': this._imageUrl.value,
      'outofstock': true
    });

    this.modalRef = this.modalService.show(this.editmodal);



  }
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      autoWidth: true,
      order: [[0, 'desc']]
    };
    this.products$ = this.productService.getProducts();
    this.products$.subscribe(result => {
      this.products = result;
      this.dtTrigger.next();
    });

    this.chRef.detectChanges();


    // Modal Message
    this.modalMessage = "Tüm alanlar doldurulmalıdır";

    // Initializing Add product properties

    let validateImageUrl: string = '^(https?:\/\/.*\.(?:png|jpg))$';

    this.name = new FormControl('', [Validators.required, Validators.maxLength(50)]);
    this.price = new FormControl('', [Validators.required, Validators.min(0), Validators.max(10000)]);
    this.description = new FormControl('', [Validators.required, Validators.maxLength(150)]);
    this.imageUrl = new FormControl('', [Validators.pattern(validateImageUrl)]);

    this.insertForm = this.fb.group({
      'name': this.name,
      'description': this.description,
      'outofstock': true,
      'imageUrl': this.imageUrl,
      'price': Number(this.price),
    });
    // Update Product properties

    this._name = new FormControl('', [Validators.required, Validators.maxLength(50)]);
    this._price = new FormControl('', [Validators.required, Validators.min(0), Validators.max(10000)]);
    this._description = new FormControl('', [Validators.required, Validators.maxLength(150)]);
    this._imageUrl = new FormControl('', [Validators.pattern(validateImageUrl)]);
    this._id = new FormControl();

    this.updateForm = this.fb.group({
      'id': this._id,
      'name': this._name,
      'description': this._description,
      'imageUrl': this._imageUrl,
      'price': Number(this._price),
      'outofstock': true,
    });


  }
  onUpdate() {
    const editProduct = this.updateForm.value;
    this.productService.updateProduct(editProduct.id, editProduct).subscribe(
      result => {
        this.productService.clearCache();
        this.products$ = this.productService.getProducts();
        this.products$.subscribe(updateList => {
          this.products = updateList;
          this.modalRef.hide();
          this.rerender();
        });
      }, error => console.log(error)
    )
  }
  onSubmit() {
    const product = this.insertForm.value;

    this.productService.insertProduct(product).subscribe(
      result => {
        this.productService.clearCache();
        this.products$ = this.productService.getProducts();

        this.products$.subscribe(newlist => {
          this.products = newlist;
          this.modalRef.hide();
          this.insertForm.reset();
          this.dtTrigger.next();
          this.rerender();
        });

      },
      error => console.log(error)

    );
  }
  onDelete(product: IProduct) {
    return this.productService.deleteProduct(product.productId).subscribe(result => {
      this.productService.clearCache();
      this.products$ = this.productService.getProducts();
      this.products$.subscribe(newlist => {
        this.products = newlist;
        this.rerender();
      });
    });
  }
  onSelect(product: IProduct) {
    this.selectedProduct = product;
    this.router.navigateByUrl('/products/' + product.productId);
  }
  // eski tabloyu silip yeniden derlenmiş tablosyu kullanmak için bu metod
  rerender() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // ilk Listelenen tabloyu siliyoruz
      dtInstance.destroy();
      //  dtTrigger yeniden render edeiyr
      this.dtTrigger.next();
    });
  }
  ngOnDestroy() {
    // Unsubscribe etmeyi sakın unutma !!

    this.dtTrigger.unsubscribe();
  }

}
