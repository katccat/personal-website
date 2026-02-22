window.addEventListener('load', function() {
    const viewport = document.querySelector("meta[name=viewport]");
    viewport.setAttribute("content", viewport.content + ", height=" + window.innerHeight);
})

const referrer = window.location.origin;
const name = document.getElementById("name");
const image = document.getElementById("image");
const description = document.getElementById("description");
const disclaimer = document.getElementById("disclaimer");

const year_input = document.getElementById("year");
let enter_pressed = false;
year_input.addEventListener('keydown', function(event) {
	if (event.keyCode === 13) {
		if (enter_pressed === false) random_playne();
		enter_pressed = true;
	}
});
year_input.addEventListener('keyup', function(event) {
	if (event.keyCode === 13) enter_pressed = false;
});
const latest_year = 2025; // latest year with a 'first flown' category
const latest_decade = latest_year - (latest_year % 10);

const dummy_image = new Image();

const wikipedia = new URL("https://en.wikipedia.org/w/api.php");
const decade_1890 = [
	"Category:Aircraft first flown in 1891",
	"Category:Aircraft first flown in 1893",
	"Category:Aircraft first flown in 1895",
	"Category:Aircraft first flown in 1896"];
const decade_1900 = [ // currently no '1902' category
	"Category:Aircraft first flown in 1900",
	"Category:Aircraft first flown in 1901",
	"Category:Aircraft first flown in 1903",
	"Category:Aircraft first flown in 1904",
	"Category:Aircraft first flown in 1905",
	"Category:Aircraft first flown in 1906",
	"Category:Aircraft first flown in 1907",
	"Category:Aircraft first flown in 1908",
	"Category:Aircraft first flown in 1909"];
const categories = [
	"Category:Individual aircraft", 
	"Category:Homebuilt aircraft",
	"Category:Unflown aircraft"];
categories.push(...decade_1890);
categories.push(...decade_1900);
for (let i = 1910; i <= latest_year; i++) categories.push("Category:Aircraft first flown in " + i);

function get_random_title(year) {
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
	if (year) {
		year = year.toLowerCase();
		if (year.slice(-2) === "0s" || year.slice(-3) === "0's" || year.slice(-3) === "0\u2019s") {
			let decade = parseInt(year);
			if (decade === 1890) params.cmtitle = decade_1890[Math.floor(Math.random() * decade_1890.length)];
			else if (decade === 1900 || decade === 0) params.cmtitle = decade_1900[Math.floor(Math.random() * decade_1900.length)];
			else if (decade === latest_decade) {
				params.cmtitle = "Category:Aircraft first flown in " + (Math.floor(Math.random() * (latest_year - latest_decade + 1)) + latest_decade);
			}
			else {
				if (decade < 100) decade += 1900;
				params.cmtitle = "Category:Aircraft first flown in " + (Math.floor(Math.random() * 10) + decade);
			}
		}
		else {
			params.cmtitle = "Category:Aircraft first flown in " + parseInt(year);
		}
	}
	else {
		params.cmtitle = categories[Math.floor(Math.random() * categories.length)];
	}
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

const damon_text = "The Lockheed Constellation, nicknamed the \"Connie\" was created at the request of Howard Hughes. " + 
"But more recently it has been nicknamed \"Khannie\" after the co-creator of this website and the loveliest person in the world.<br><br>" + 
"- Damon";

// Function to fetch content of the article using its title
function get_content(title) {
	if (title === "Lockheed Constellation") {
		name.textContent = title;
		image.src = "constellation.jpg";
		description.innerHTML = damon_text;
		disclaimer.style.visibility = "hidden";
		return;
	}
	const params = {
		action: 'query',
		prop: 'extracts|pageimages',
		piprop: 'thumbnail',
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
		if (page.thumbnail) {
			dummy_image.src = page.thumbnail.source;
			dummy_image.onload = function() {
				change_name(title);
				image.src = page.thumbnail.source;
				description.textContent = page.extract;
				disclaimer.style.visibility = "hidden";
			}
		}
		else {
			console.log("Google fallback requested ^");
			fetch("https://backend.clayrobot.net:8000/randomplanes?plane=" + title, {
	                headers: {
	                        'Referer': referrer
	                }
                })
			.then(response => response.json())
			.then(data => {
				//console.log(data);
				const link = data.items[0].link;
				dummy_image.src = link;
				dummy_image.onload = function() {
					change_name(title);
					image.src = link;
					description.textContent = page.extract;
					disclaimer.style.visibility = "visible";
				}
				dummy_image.onerror = function(error) {
					console.error("Google fallback failed:", error);
					change_name(title);
					image.src = "no_image.png";
					description.textContent = page.extract;
					disclaimer.style.visibility = "hidden";
				}
			})
			.catch(error => {
				console.error("Google fallback failed:", error);
				change_name(title);
				image.src = "no_image.png";
				description.textContent = page.extract;
				disclaimer.style.visibility = "hidden";
			});
		}
	});
}

function random_playne(year = year_input.value) {
	get_random_title(year)
	.then(title => {
		console.log(title);
		get_content(title);
	})
	.catch(error => {
		change_name();
		image.src = "no_image.png";
		description.textContent = "";
		disclaimer.style.visibility = "hidden";
		console.error("Error fetching article:", error)
	});
}
