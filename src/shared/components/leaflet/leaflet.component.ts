import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as  L from 'leaflet';

@Component({
  selector: 'app-leaflet',
  standalone: true,
  imports: [],
  templateUrl: './leaflet.component.html',
  styleUrl: './leaflet.component.scss'
})
export class LeafletComponent implements OnInit,AfterViewInit, OnChanges{
  private map!: L.Map
  @Input() x!: number;
  @Input() y!: number;
  markers!: L.Marker[]; 

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.initMap();
    this.centerMap();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.markers = [
      L.marker([this.x,this.y]) 
    ];
    this.centerMap();
  }

  private initMap() {
    const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    this.map = L.map('map');
    L.tileLayer(baseMapURl).addTo(this.map);
  }


  private centerMap() {
     this.markers = [
      L.marker([this.x,this.y]) 
    ];
    // Create a boundary based on the markers
    const bounds = L.latLngBounds(this.markers.map(marker => marker.getLatLng()));
    
    // Fit the map into the boundary
    this.map.fitBounds(bounds);
    this.map.setZoom(16);
  }
}
