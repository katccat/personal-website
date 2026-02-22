window.addEventListener('load', function() {
    const viewport = document.querySelector("meta[name=viewport]");
    viewport.setAttribute("content", viewport.content + ", height=" + window.innerHeight);
})

const referrer = window.location.origin;
const botw = "Philippine dwarf kingfisher";
const name = document.getElementById("name");
const image = document.getElementById("image");
const logo = document.getElementById("logo");
const description = document.getElementById("description");
const disclaimer = document.getElementById("disclaimer");
let previous_bird;

let egg = true;
function toggle_egg() {
	if (image.src.slice(-15) === "cracked_egg.png") {
		image.src = "alt_egg.png";
		image.style.transform = "";
	}
	else if (image.src.slice(-7) === "egg.png") {
		image.src = "alt_cracked_egg.png";
		image.style.transform = "rotate(1deg)";
	}
}
image.addEventListener('mouseover', toggle_egg);
image.addEventListener('mouseleave', toggle_egg);

const latest_year = 2025; // latest year with a 'described in' category
const latest_decade = latest_year - (latest_year % 10);

const dummy_image = new Image();

const wikipedia = new URL("https://en.wikipedia.org/w/api.php");
const categories = [
	"Category:Birds described in 1758",
 	"Category:Birds described in 1761",
 	"Category:Birds described in 1763",
 	"Category:Birds described in 1764"];
for (let i = 1766; i <= latest_year; i++) categories.push("Category:Birds described in " + i);

const forbidden_words = ["_map", "location", "skull", "bone", "humerus", "femur", "distribution", "specimen"];
const birds_without_photo = ["saint helena cuckoo", "saint helena rail", "antillean cave rail", "matuku otagoense", "niue rail"];

function get_random_title() {
	// Parameters for the API request
	const params = {
		action: 'query',
		list: 'categorymembers',
		cmlimit: 500,
		format: 'json',
		cmtype: 'page',
		cmprop: 'title',
		origin: '*'
	};
	params.cmtitle = categories[Math.floor(Math.random() * categories.length)];
	// Construct URL
	wikipedia.search = new URLSearchParams(params).toString();
	
	// Fetch random article title
	return fetch(wikipedia)
	.then(response => response.json())
	.then(data => {
		const articles = data.query.categorymembers;
		const index = Math.floor(Math.random() * articles.length);
		return articles[index].title;
	});
}

function change_name(article_name) {
	if (article_name) {
		name.textContent = article_name.replaceAll("_", " ");
		name.href = "https://en.wikipedia.org/wiki/" + article_name.replaceAll(" ", "_");
	}
	else {
		name.textContent = "No Article Found";
		name.removeAttribute('href');
	}
}

function change_picture(source, googled = false, bespoke = true) {
	if (source) {
		image.src = source;
		disclaimer.style.visibility = googled ? "visible" : "hidden";
	}
	else {
		image.src = "no_image.png";
		disclaimer.style.visibility = "hidden";
	}
	if (bespoke === true) image.classList.toggle("bespoke", true);
	else image.classList.toggle("bespoke", false);
}
//White-bearded_greenbul
//Criniger_ndussumensis_distribution_map.png
//Pyrrhura_caeruleiceps_Range_Map.png
//Grallaria_atuensis_map.svg
//Grallaria_eludens_map.svg
//Basileuterus_punctipectus_map.svg
//Xenoglaux_loweryi_map.svg
//LocationSaintHelena.png

// Function to fetch content of the article using its title
function get_content(title) {
	if (title === previous_bird) return;
	previous_bird = title;
	const params = {
		action: 'query',
		prop: 'extracts|pageimages',
		piprop: 'thumbnail|name',
		pithumbsize: 800,
		pilicense: 'any',
		titles: title,
		format: 'json',
		formatversion: 2,
		exsentences: 2, // Number of sentences to retrieve as an extract
		exintro: 1,
		explaintext: 1, // Return plaintext extract
		origin: '*'
	  };
	  
	wikipedia.search = new URLSearchParams(params).toString();
	fetch(wikipedia)
	.then(response => response.json())
	.then(data => {
		const page = data.query.pages[0];
		if (page.pageimage) page.pageimage = page.pageimage.toLowerCase();
		if (page.thumbnail && !(forbidden_words.some(phrase => page.pageimage.includes(phrase)))) {
			dummy_image.src = page.thumbnail.source;
			dummy_image.onload = function() {
				change_name(title);
				change_picture(page.thumbnail.source, false);
				description.textContent = page.extract;
			}
		}
		else {
			console.log("Google fallback requested ^");
			fetch("https://backend.clayrobot.net/randombirds?bird=" + title, {
	                headers: {
	                        'Referer': referrer
	                }
                })
			.then(response => response.json())
			.then(data => {
				//console.log(data);
				const src = data.items[0].link;
				dummy_image.src = src;
				dummy_image.onload = function() {
					change_name(title);
					change_picture(src, true);
					description.textContent = page.extract;
				}
				dummy_image.onerror = function(error) {
					console.error("Google fallback failed:", error);
					change_name(title);
					change_picture();
					description.textContent = page.extract;
				}
			})
			.catch(error => {
				console.error("Google fallback failed:", error);
				change_name(title);
				change_picture();
				description.textContent = page.extract;
			});
		}
	});
}

function random_bird(retry_count = 0) {
	const max_retries = 5;
	get_random_title()
	.then(title => {
		if (!birds_without_photo.includes(title.toLowerCase())) {
			console.log(title);
			get_content(title);
		}
		else if (retry_count < max_retries) {
			console.log(title + " skipped.");
			random_bird(retry_count + 1);
		}
		else {
			throw "Retries exceeded.";
		}
	})
	.catch(error => {
		change_name();
		change_picture();
		description.textContent = "";
		console.error("Error fetching article:", error)
	});
}
