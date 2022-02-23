import { NgModule } from '@angular/core';
import { SafeHtmlPipe } from './safe-html.pipe';
import { SafeUrlPipe } from './safe-url.pipe';
import { SplitAddressPipe } from './split-address.pipe';

@NgModule({
declarations: [SafeHtmlPipe, SafeUrlPipe, SplitAddressPipe],
imports: [],
exports: [SafeHtmlPipe, SafeUrlPipe, SplitAddressPipe],
})

export class PipesModule {}