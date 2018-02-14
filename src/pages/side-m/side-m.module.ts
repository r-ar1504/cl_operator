import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SideMPage } from './side-m';

@NgModule({
  declarations: [
    SideMPage,
  ],
  imports: [
    IonicPageModule.forChild(SideMPage),
  ],
})
export class SideMPageModule {}
