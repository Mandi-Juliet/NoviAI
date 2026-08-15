const express = require("express");

const router = express.Router();

router.get("/image-search", async (req, res) => {

    const query = req.query.q;

    if (!query) {
        return res.status(400).json({
            error: "Please provide a search query."
        });
    }

    try {

        const params = new URLSearchParams({

            action: "query",

            generator: "search",

            gsrsearch: query,

            gsrnamespace: "6",

            gsrlimit: "10",

            prop: "imageinfo",

            iiprop: "url|extmetadata",

            iiurlwidth: "500",

            format: "json",

            origin: "*"

        });


        const url =
            "https://commons.wikimedia.org/w/api.php?" +
            params.toString();


        console.log(
            "IMAGE SEARCH:",
            query
        );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `Wikimedia returned ${response.status}`
            );

        }


        const data =
            await response.json();


        const pages =
            data.query?.pages || {};


        const results =
            Object.values(pages)

                .map(page => {

                    const info =
                        page.imageinfo?.[0];


                    if (!info) {
                        return null;
                    }


                    return {

                        title:
                            page.title
                                .replace("File:", ""),

                        image:
                            info.thumburl ||
                            info.url,

                        original:
                            info.url,

                        source:
                            info.descriptionurl ||
                            `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,

                        description:
                            info.extmetadata
                                ?.ImageDescription
                                ?.value || ""

                    };

                })

                .filter(Boolean);


        console.log(
            "IMAGES FOUND:",
            results.length
        );


        res.json({

            query: query,

            results: results

        });


    }

    catch (error) {

        console.error(
            "IMAGE SEARCH ERROR:",
            error
        );


        res.status(500).json({

            error:
                "Unable to search for images right now."

        });

    }

});


module.exports = router;