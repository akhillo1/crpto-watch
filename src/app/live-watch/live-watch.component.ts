import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy
  } from '@angular/core';
import { DataService } from '../common-service/socket.service';
import constants from '../common-service/globalConstant'; 
import SubcriptionPair from '../model/subcription-pair';


// Focused mainly on the websocket live streaming api directly 
// History and other rest api can be added a tab 
@Component({
  selector: 'live-watch',
  templateUrl: './live-watch.component.html',
  styleUrls: ['./live-watch.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveWatchComponent implements OnInit, OnDestroy {

    constructor(private service: DataService) {
      this.coinList = constants.COIN_LIST;
      this.currencyList = constants.CURRENCY_LIST;
      this.selectedCurrency = 'USD';
      // Assumed the market is Coinbase for now 
      this.market = 'Coinbase';
      this.subscriptionPair = this.getUpdatedSubscriptionPair();
      this.getRowNodeId = function (data:any) {
        return data.ID;
      };
    }

    getUpdatedSubscriptionPair = () => {
      this.rowData = [];
      return this.coinList.map(coin => {
        const pairInfo = new SubcriptionPair(coin, this.selectedCurrency, this.market);
        this.rowData.push({
          ID: pairInfo.id,
          FROMSYMBOL: coin,
          TOSYMBOL: this.selectedCurrency,
          REMARKS: 'Data not available'
        });
        return pairInfo;
      });
    } 
    
    private coinList: string[];
    currencyList: string[];
    private subscriptionPair: SubcriptionPair[];
    selectedCurrency: string;
    private market: string;
    rowData: any;
    private gridApi: any;
    private gridColumnApi: any;
    getRowNodeId: any;

    onCurrencyChange = (event: any) => {
      this.selectedCurrency = event.target.value;
      console.log(this.selectedCurrency);
      this.service.removeSubscriptionItems(this.subscriptionPair.map(item => item.id));
      this.subscriptionPair = this.getUpdatedSubscriptionPair();
      this.gridApi.setRowData(this.rowData);
      this.service.addSubscriptionItems(this.subscriptionPair.map(item => item.id));
    };

    ngOnInit() {
      this.service.connect(this.recieveStreamData, this.openStreamConnection);
    }

    openStreamConnection = () => {
      this.service.addSubscriptionItems(this.subscriptionPair.map(item => item.id));
    }

    numberFormatter = (params: any) => {
      if (typeof params.value === 'number') {
        return params.value.toFixed(3);
      }
      return params.value;
    }

    // Handle all types of messages - like health check, subscribe/unsubscribe 
    // Have a separate service to handle the messages 
    recieveStreamData = (data: any) => {
      const coinInfo = JSON.parse(data.data);
      console.log(coinInfo);
      if (coinInfo.TYPE == 500) {
        coinInfo.ID = coinInfo.PARAMETER;
        coinInfo.REMARKS = coinInfo.MESSAGE;
        this.gridApi.applyTransaction({ update: [coinInfo] });
      }
      if (coinInfo && coinInfo.MARKET && (coinInfo.FLAGS === 1 || coinInfo.FLAGS === 1)) {
        coinInfo.ID = `2~${coinInfo.MARKET}~${coinInfo.FROMSYMBOL}~${coinInfo.TOSYMBOL}`;
        this.gridApi.applyTransaction({ update: [coinInfo] });
      }
    }

    ngOnDestroy() {
      this.service.close();
    }

    onGridReady = (params: any) => {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
    }

    title = 'crypto-watch';
    columnDefs = [
        { field: 'ID', sortable: true, filter: true },
        { field: 'FROMSYMBOL', sortable: true, filter: true },
        { field: 'TOSYMBOL', sortable: true, filter: true },
        { field: 'PRICE', cellClass: 'cell-number', cellRenderer: 'agAnimateShowChangeCellRenderer', valueFormatter: this.numberFormatter, sortable: true, filter: true },
        { field: 'VOLUMEDAY', sortable: true, filter: true },
        { field: 'VOLUME24HOUR', sortable: true, filter: true },
        { field: 'REMARKS', sortable: true, filter: true, tooltipField: 'REMARKS' }
    ];
}
