import { LocalizacaoProvider } from './../../providers/localizacao/localizacao';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapOptions,
  Marker,
  Circle,
  Geocoder,
  GeocoderResult,
  MarkerOptions,
  GoogleMapsMapTypeId,
  GoogleMapsEvent
} from '@ionic-native/google-maps';

import { NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';
import { Address } from '../../providers/MinhasClasses';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  map: GoogleMap;
  geoLatitude: number;
  geoLongitude: number;
  geoAccuracy: number;
  enderecoOcorrencia: string;
  buscarPor: string;
  markerOptions: MarkerOptions;
  marker: Marker;
  loading: any;
  iLatLng = { lat: 0, lng: 0 };

  endereco: Address;

    constructor(public navCtrl: NavController, public navParams: NavParams, private platform: Platform, private localizacao: LocalizacaoProvider,
      private loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MapaPage');
    this.platform.ready().then((readySource) => {
      this.initPage();
    });
  }

  initPage() {

    this.presentLoadingDefault("Atualizando localização");

    this.localizacao.getGeoLocationPosition().then((resp) => {
      this.geoLatitude = resp.coords.latitude;
      this.geoLongitude = resp.coords.longitude;
      this.geoAccuracy = resp.coords.accuracy;

      this.getGeoEncoder();

      this.loading.dismiss();
      //marcar no mapa a posicao atual
      this.addMarker();

      this.iLatLng = { lat: this.geoLatitude, lng: this.geoLongitude };


    }).catch((error) => {
      console.log(error);
      this.loading.dismiss();
    });

  }


  buscarEndereco(evt) {
    //console.log(evt.key);
    if (evt.key === "Enter"){
      Geocoder.geocode({
        "address": this.buscarPor
      }).then((results: GeocoderResult[]) => {
        console.log(results);
        if (results.length > 0) {

          this.geoLatitude = results[0].position.lat;
          this.geoLongitude = results[0].position.lng;
          this.marker.setPosition(results[0].position);
          this.getGeoEncoder();
          this.map.setCameraTarget(results[0].position);
          this.map.setCameraZoom(18);
          this.map.setCameraTilt(30);
          this.addMarker();

          //return this.marker;
        } else {
          return null;
        }
      });
    }
  }

  userLocation() {
    this.initPage();
  }


  getGeoEncoder() {
    this.localizacao.getGeoencoder(this.geoLatitude, this.geoLongitude)
      .then((result: NativeGeocoderReverseResult) => {


        this.enderecoOcorrencia = this.localizacao.generateAddress2(result[0]);

        this.marker.setDraggable(true);
        this.marker.setTitle(this.enderecoOcorrencia); //this.marker.get("address"));
        this.marker.setSnippet("Latitude:" + this.iLatLng.lat + " ,  Longitude:" + this.iLatLng.lng); //this.marker.get("address"));
        this.marker.showInfoWindow();

      })
      .catch((error: any) => {
        console.log('Error getting location' + JSON.stringify(error));
      });
  }


  loadMap() {
    //coordenadas iniciais e configuracao do mapa
    let mapOptions: GoogleMapOptions = {
      camera: {
        target: { lat: this.geoLatitude, lng: this.geoLongitude },
        zoom: 18,
        tilt: 30
      }
    };
    //CRIAR O MAPA
    this.map = GoogleMaps.create('map_canvas', mapOptions);
  }

  addMarker() {
    //adicionar ponto no mapa.
    if (this.map == undefined) {
      this.loadMap();
    }

    this.cleanMarkers();

    let localAtual = { lat: this.geoLatitude, lng: this.geoLongitude }

    //não existe ainda, 
    this.markerOptions = {
      position: localAtual,
      animation: 'DROP',
      draggable: true,
      snippet: this.enderecoOcorrencia,
      icon: "green",
      mapTypeId: GoogleMapsMapTypeId.ROADMAP
    }

    //criar a marca no mapa.
    this.marker = this.map.addMarkerSync(this.markerOptions);

    //adicionar um circulo no mapa, abaixo do ponto marcada
    this.map.addCircle({
      center: this.marker.getPosition(),
      radius: 6,
      fillColor: "rgba(0,0,255,0.25)",
      strokeColor: "rgba(0,0,255,0.55)",
      strokeWidth: 1
    }).then((circle: Circle) => {
      this.marker.bindTo("position", circle, "center");
    });

    this.getPositionMarker();

    this.marker.on(GoogleMapsEvent.MARKER_DRAG_END).subscribe(() => {
      this.getPositionMarker();
      this.getGeoEncoder();
    });

    this.marker.on("position_changed").subscribe((params: any) => {
      //olds params[0]
      //new params[1]
      if (params.length > 0) {
        this.iLatLng = params[1];
        //console.log(params);
      }
    });

    this.map.setCameraTarget(localAtual);
    this.map.setCameraZoom(18);
    this.map.setCameraTilt(30);

  }


  /*
   
  */
  setInfoWindow() {

    let localizacao = this.endereco.thoroughfare + ", " + this.endereco.subThoroughfare + "<br>" +
      this.endereco.postalCode + ", " + this.endereco.subLocality + "<br>" +
      this.endereco.subAdministrativeArea + ", " + this.endereco.administrativeArea + " / " + this.endereco.countryCode;

    let frame: HTMLElement = document.createElement('div');
    frame.innerHTML = [
      '<h3>Localização</h3>',
      '<p>' + localizacao + '</p>',
    ].join("");
    //this.htmlInfoWindow.setContent(frame, { width: "250px", height: "150px" });
  }

  cleanMarkers() {
    this.map.clear();
  }

  getPositionMarker() {
    this.iLatLng = this.marker.getPosition();
    this.geoLatitude = this.iLatLng.lat;
    this.geoLongitude = this.iLatLng.lng;
    // console.log(this.iLatLng);
  }

  presentLoadingDefault(mensagem: string) {
    this.loading = this.loadingCtrl.create({
      content: `
      <div class="custom-spinner-container">
        <div class="custom-spinner-box">`+ mensagem + `...</div>
      </div>`
    });
    this.loading.present();
  }

}
