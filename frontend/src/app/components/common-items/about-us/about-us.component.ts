import { Component, OnInit } from '@angular/core';
import { Map, tileLayer, marker } from 'leaflet';
import { Store } from 'src/app/models/store';
import { StoreRestService } from 'src/app/services/store-rest.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css'],
})
export class AboutUsComponent implements OnInit {
  public store!: Store;
  public html = '';

  constructor(private restStore: StoreRestService) {}

  ngOnInit(): void {
    const map = new Map('map').setView([41.366912, -8.194828], 13);
    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    this.restStore.getStoreInformation().subscribe((store: Store) => {
      this.store = store;

      const markerItem = marker([41.366912, -8.194828])
        .addTo(map)
        .bindPopup(`<h6>Livraria</h6><br>${this.store.address}   ${this.store.zipCode}<br><strong>${this.store.city}</strong>`);

      map.fitBounds([[markerItem.getLatLng().lat, markerItem.getLatLng().lng]]);
    });
  }
}
