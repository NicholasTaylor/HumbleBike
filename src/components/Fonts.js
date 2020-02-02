import React from 'react';
import {ADOBE_FONTS} from '../constants/fonts';

function CustomFonts(){
	if (ADOBE_FONTS){
		return(
			<link
				rel="stylesheet" 
				href={ADOBE_FONTS}
			/>
		)
	} else {
		return ''
	}
}

export default CustomFonts;