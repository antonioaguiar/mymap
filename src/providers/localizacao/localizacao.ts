import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder } from '@ionic-native/native-geocoder';
import { Address } from '../MinhasClasses';


@Injectable()
export class LocalizacaoProvider {


  map: any;
  geoLatitude: number;
  geoLongitude: number;
  geoAccuracy: number;
  geoAddress: string;

  watchLocationUpdates: any;
  loading: any;
  isWatching: boolean;
  localization: any;
  public enderecoStr: string;
  public endereco: Address;

  constructor(private geolocation: Geolocation, private nativeGeocoder: NativeGeocoder) {
    console.log('Hello LocalizacaoProvider Provider');
  }
 
  getGeoLocationPosition() {
    return this.geolocation.getCurrentPosition();
  }

  //geocoder method to fetch address from coordinates passed as arguments
  getGeoencoder(latitude: number, longitude: number) {
    return this.nativeGeocoder.reverseGeocode(latitude, longitude);
  }

  //Return  address
  generateAddress(addressObj) {
 
    this.enderecoStr = addressObj.thoroughfare + ", " + addressObj.subThoroughfare + ", " + addressObj.postalCode + " - " +
      addressObj.subLocality + ", " + addressObj.subAdministrativeArea + ", " + addressObj.administrativeArea;
    this.endereco = addressObj;

    return this.enderecoStr;
 
  }

  generateAddress2(addressObj) {
 
    this.enderecoStr = addressObj.thoroughfare + ", " + addressObj.subThoroughfare + "\n" + addressObj.postalCode + " - " +
      addressObj.subLocality + "\n" + addressObj.subAdministrativeArea + ", " + addressObj.administrativeArea;
    this.endereco = addressObj;

    return this.enderecoStr;
 
  }

  getAddressLocation(addressObj): Address {
    return addressObj;
  }

  //Start location update watch
  watchLocation() {
    this.isWatching = true;
    this.watchLocationUpdates = this.geolocation.watchPosition();
    this.watchLocationUpdates.subscribe((resp) => {
      this.geoLatitude = resp.coords.latitude;
      this.geoLongitude = resp.coords.longitude;
      this.getGeoencoder(this.geoLatitude, this.geoLongitude);
    });
  }

  //Stop location update watch
  stopLocationWatch() {
    this.isWatching = false;
    this.watchLocationUpdates.unsubscribe();
  }

}


