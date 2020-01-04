import { Component, Optional, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef, QueryList, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { debounceTime, tap, switchMap, finalize, delay, mergeMap, map } from 'rxjs/operators';
import { merge, Observable, of as observableOf } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from 'selenium-webdriver/http';
import { MatTableDataSource, MatPaginator } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {

  accountHolderName: string ;
  openingAmount: number = 0.0;
  balanceForAccountNumber: string;
  balance: number ;


  fromAccount: string ;
  toAccount: string ;
  transferAmount: number;

  withdrawFromAccount: string ;
  withdrawAmount: number ;

  depositAccountNumber: string ;
  depositAmount: number ;


  base_url = 'http://localhost:8080';

  displayedColumns: string[] = ['accountNumber', 'withdrawl', 'deposit', 'transactionDate'];
  accDisplayedColumns: string[] = ['accountNumber', 'amount', 'createdDate'];
  dataSource = new MatTableDataSource<TxHistory>([]);
  accDataSource = new MatTableDataSource<AccountTxHistory>([]);

  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  //@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  //@ViewChild(MatAccountPaginator, {static: true}) accpaginator: MatPaginator;
   /**
   * Set the paginator after the view init since this component will
   * be able to query its view for the initialized paginator.
   */
  ngAfterViewInit() {
    //this.dataSource.paginator = this.paginator;
    //this.accDataSource.paginator = this.accpaginator;
    this.dataSource.paginator = this.paginator.toArray()[0];
    this.accDataSource.paginator = this.paginator.toArray()[1];
  }

  constructor(private http: Http
    , private _snackbar: MatSnackBar
    , private changeDetectorRefs: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    this.loadTransaction();
    this.loadAccountTransactions();
    this.changeDetectorRefs.detectChanges();
  }

  public getBalance() {
    this.getBalanceForAccount(this.balanceForAccountNumber);
  }
  private  getBalanceForAccount(account: string) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(`${this.base_url}/accounts/${account}`, options)
      .toPromise()
      .then(res => {
        let body: Account = res.json();
        const acc: Account = body;
        this.balanceForAccountNumber = account;
        this.balance = acc.balance;
      })
      .catch(err => this.handleErrorPromise(err));
  }
  /**
   * open account
   */
  public opeanAccount() {
    const acc: Account = new Account();
    acc.acountHolder = this.accountHolderName;
    acc.balance = this.openingAmount;
    this.createAccount(acc);
    console.log('hello open accout clicked');
  }

  private createAccount(acc: Account): Promise<Account> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(`${this.base_url}/accounts`, acc, options)
      .toPromise()
      .then(res => this.extractData(res))
      .catch(err => this.handleErrorPromise(err) );
  }

  private extractData(res: Response) {
    let body: Account = res.json();

    console.log(body);
    if (body) {
      this.showSnackbar('Sucess! account Number #', body.accountNumber);
    }
    return body || {};
  }
  private handleErrorObservable(error: Response | any) {
    console.error(error.message || error);
    return Observable.throw(error.message || error);
  }

  private handleErrorPromise(error: Response | any) {
    let err: any = error.json();
    console.error(err.message || err);
    this.showSnackbar('Error ', err.message || err);
    return Promise.reject(err.message || err);
  }

  private showSnackbar(header: string, body: string) {
    this._snackbar.open(header, body, {duration: 5000});
  }
  /*
  * transfer amount
  */
   public transfer() {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let transferReq: TransferToAccountModel = new TransferToAccountModel();
    transferReq.fromAccountNumber = this.fromAccount;
    transferReq.toAccountNumber = this.toAccount;
    transferReq.transferAmount = this.transferAmount;
    return this.http.post(`${this.base_url}/transfer`, transferReq,  options)
      .toPromise()
      .then(res => this.extractForTRansactionSuccess(res))
      .catch(err => this.handleErrorPromise(err));
   }
   private extractForTRansactionSuccess(res: Response) {
    this.showSnackbar('Sucess !', '');
    this.loadTransaction();
    this.loadAccountTransactions();
    const account: string = this.fromAccount
        ? this.fromAccount
          : (this.withdrawFromAccount
                ? this.withdrawFromAccount
                : (this.depositAccountNumber ? this.depositAccountNumber : null) );
    if (account) {
      this.getBalanceForAccount(this.fromAccount);
    }

    return  {};
  }

  /*
  * withdraw amount
  */
 public Withdraw() {
  let headers = new Headers({ 'Content-Type': 'application/json' });
  let options = new RequestOptions({ headers: headers });
  let withdrawReq: WithdrawFromAccountModel = new WithdrawFromAccountModel();
  withdrawReq.fromAccountNumber = this.withdrawFromAccount;
  withdrawReq.withdrawlAmount = this.withdrawAmount;
  return this.http.post(`${this.base_url}/Withdraw`, withdrawReq, options)
    .toPromise()
    .then(res => this.extractForTRansactionSuccess(res))
    .catch(err => this.handleErrorPromise(err));
 }

 /*
  * deposit amount
  */
 public deposit() {
  let headers = new Headers({ 'Content-Type': 'application/json' });
  let options = new RequestOptions({ headers: headers });
  let depositRequest: DepositToAccountModel = new DepositToAccountModel();
  depositRequest.depositorAccountNumber = this.depositAccountNumber;
  depositRequest.depositAmount = this.depositAmount;
  return this.http.post(`${this.base_url}/deposit`, depositRequest, options)
    .toPromise()
    .then(res => this.extractForTRansactionSuccess(res))
    .catch(err => this.handleErrorPromise(err));
 }

  /**
   * load transaction
   */
  private loadTransaction() {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(this.base_url + '/transaction-history', options)
      .toPromise()
      .then(res => this.extractDataToMatTableDataSource(res))
      .catch(err => this.handleErrorPromise(err));
  }
  private extractDataToMatTableDataSource(res: Response) {
    let body: TxHistory[] = res.json();
    this.dataSource.data = body;
    console.log(body);
    return body || {};
  }

  /**
   * load account transaction
   */
  private loadAccountTransactions() {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(this.base_url + '/account-transaction-history', options)
      .toPromise()
      .then(res => this.extractDataToAccountMatTableDataSource(res))
      .catch(err => this.handleErrorPromise(err));
  }
  private extractDataToAccountMatTableDataSource(res: Response) {
    let body: AccountTxHistory[] = res.json();
    this.accDataSource.data = body;
    console.log(body);
    return body || {};
  }

}


export class Account {
  public accountNumber?: string;
  public acountHolder?: string;
  public balance?: number;
  public createdDate?: Date;
}

export interface TxHistory {
  accountNumber: string;
  withdrawl: number;
  deposit: number;
  transactionDate: Date;
}

export interface AccountTxHistory {
  accountNumber: string;
  amount: number;
  createdDate: Date;
}

export class TransferToAccountModel {
  fromAccountNumber: string;
  toAccountNumber: string;
  transferAmount: number;
}
export class DepositToAccountModel {
  depositorAccountNumber: string;
  depositAmount: number;
}
export class WithdrawFromAccountModel {
  fromAccountNumber: string;
  withdrawlAmount: number;
}
