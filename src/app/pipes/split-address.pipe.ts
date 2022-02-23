import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'splitAddress'
})
export class SplitAddressPipe implements PipeTransform {

  transform(data) {
  	var res = data.split(",");
  	console.log(res);

  	if(res.length > 3){
  		return res[res.length-3]+', '+res[res.length-2]+','+res[res.length-1];

  	}else{
  		return data;
  	}

  }

}
