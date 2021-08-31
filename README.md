do# HumbleBike
_Life should be simpler. So should finding a CitiBike._

**Live Site:** [https://humble.bike](https://humble.bike)

HumbleBike is made to track bike and dock availability in New York's CitiBike system with a simple, text-based UI. This makes it easy for older phones or phone's with poor signal to see what's near them. Though it's made with NYC's CitiBike population in mind, it should be reasonably compatible with any bikeshare system using the General Bikeshare Feed Specification (GBFS). More on that below.

# Initial Install

This assumes basic familiarity with:
* Command-line shell (ex. Apple's Terminal app)
* An IDE (ex. Sublime Text, PhpStorm)
* NPM
* HTML, CSS, Javascript (React and Redux, specifically)
* A webfont provider (ex. Adobe Fonts, Google Fonts)

After downloading and unzipping the zip off GitHub, open your shell and cd over to the unzipped directory. In the root of the unzipped directory, simply run `npm install` to generate node_modules and grab all your dependencies.

# Font Setup

HumbleBike is most of the way setup. Now we just have to configure the font file. From the root of this project folder go to the constants directory and change fonts-SAMPLE.js to fonts.js:
`cd src/constants && mv fonts-SAMPLE.js fonts.js`

Now, if you have certain webfonts you want to use on your implementation of HumbleBike, go to the webfont provider of your choice and build your font package. These providers typically give you a URL to put into the `<link rel="stylesheet">` tag. Copy that URL to your clipboard. warm up the IDE of your choice and open this fonts.js file. The file should just be one line of JS:
`export const ADOBE_FONTS = '';`

Inside of the single quotes, paste your URL and save.

In my implementation, I used the fonts Agenda and Agenda-Condensed. If you use different fonts, there is an extra step here. Simple go to src/index.css in your IDE. You're looking to change 2 CSS blocks.

The first one controls most of the font styling for the app:

```
h1, h2, h3, h4, h5, h6, #container-footer {
    font-family: agenda, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 'helvetica neue', helvetica, arial, sans-serif;
    line-height: 1em;
}
```

The second controls the labels for the bike/dock types:


```
h5.descriptor {
    font-family: agenda-condensed;
    font-weight: 500;
}
```

Replace the Agenda fonts with the font of your choosing in both blocks and save.

# Other Bikeshares

In theory, CitiBIke uses GBFS along with dozens of other bikeshare programs. **This has not been tested by me, so tinker at your own risk.**

That said, if you wanted to try and rework the app so you can try it with your city's GBFS-compatible bikeshare program, you should open `src/middleware/index.js` in your IDE and look for these blocks of code:

```
const getStation = (input) => {
	return fetch('https://gbfs.citibikenyc.com/gbfs/en/station_status.json')
		.then((response)=>response.json())
		.then((json)=>{
			Object.assign(input,json);
			return input;
		})
}

const getInfo = (input) => {
	return fetch('https://gbfs.citibikenyc.com/gbfs/en/station_information.json')
		.then((response)=>response.json())
		.then((json)=>{
			Object.assign(input,json);
			return input;
		})
}
```

For the uninitiated, GBFS seems to have 2 separate endpoints that generate JSON – one to give basic station information (station_information.json) and the other that gives bike availability (station_status.json). You'll need to find your bikeshare's URLs for both of these endpoints (Psst! Check out [these guys over here](https://github.com/NABSA/gbfs). The `systems.csv` file will probably have your bikeshare if it uses GBFS)

Once you have your URLs, simply paste the `station_status.json` and the `station_information.json` URLs in between the single quotes of the fetch methods for `getStation` and `getInfo` respectively and test it out!

**Note:** If you're doing this, you may want to hop over to `src/components/Logo.js` and edit/delete this block:

```
<h2>
	Life should be simpler. So should finding a CitiBike.
</h2>
```

It'd be a little awkward to talk about CitiBike at this point if you're retrofitting this to your city. `-_-;`


# Testing, Building, Etc.

Now, you should be good to launch the app. All the typical React NPM commands apply:
* `npm start` – Starts the app in dev mode
* `npm test` – Starts the app in interactive watch mode
* `npm run build`  – Generates an optimized production build for you to upload to your site and run

Have fun!
-Nicholas Taylor
