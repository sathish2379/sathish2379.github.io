# Homework #4: Argumentative Vis

In this homework, you will create a pair of data visualizations that argue for opposing viewpoints, using the same base dataset.

Your completed submission should include the following files:
* `index.html`: The webpage with the visualizations.
* `data/`: The folder containing your dataset file(s).
* Any other necessary files like CSS, JS, etc.

(If your dataset is larger than 10 MB, please only extract the portions needed for the visualizations.)

## Design requirements

Using techniques from the Storytelling lecture and the Visualization Rhetoric paper reading, you will create two visualizations about a dataset that frame the data with opposite narratives.

First, find a dataset about a "controversial" topic. In other words, you want a topic with strong opinions on both sides of the issue. Here are some examples of topics that could work: a political issue, science, religion, sociocultural, economics, immigration, sports, climate change, geopolitical sovereignty, etc. Topics from other regions or countries are also allowed. Good places to look for this data include Kaggle and news organizations that provide access to their data (538, New York Times, etc.).

> **COVID-19 datasets** are NOT allowed, though, you are free to look at examples of opposing COVID visualizations for inspiration.

Next, create your `index.html` page with two visualizations placed side-by-side (one on the left, one on the right). The two visualizations should use the same base dataset. Not all attributes are required to be the the same, and you are free to preprocess the data differently for each visualization (if desired), including aggregating data, filtering data, creating derived attributes, etc. but use the same source must be used. (In other words, you cannot go find two datasts and merge them together.) Your charts should also be static (i.e., no interactions, animations, etc.).

Above the two charts, add your name and email, and a title for the assignment (similar to prior homeworks). Then, in 1-2 paragraphs, briefly introduce your topic, explain why it is considered controversial, and provide a link to the source dataset you use. Below this, put your two visualizations side-by-side. The left-side visualization should be rhetorically framed to argue "in support" of the topic in some way, and the right-side visualization should be rhetorically framed to take the opposite perspetive (i.e., arguing against the topioc or viewpoint). 

> 🔍 One way to consider this is by posing the topic as a question, and the two visualizations are two opposite answers it. The left-visualization could supports the "Yes" answer, and the right-visualization supports the opposite "No" answer. You can also frame it like a debate: one "team" (the left visualization) argues the affirmative position, while the other (the right visualization) argues the negative. 

Again, the trick is that you will use the _same base dataset_ for both visualizations (though, again, the subsets of the data that you pull may be different!), and you'll employ rhetorical techniques to help frame the data in opposing ways. Some examples of how you might do this include: filtering some of the data, picking different attributes to show, using diffrent ranges (timescales, etc), using different granularities, clustering or binning the data, using text annotating on the charts, picking colors or channels to emphasize some aspect of the data. You're allowed to pre-process the data or break up the data into multiple files if necessary. 

> 🔍 **Hint:** Even though you have to use the same base dataset for your charts, you are allowed to integrate additional information, images, factoids, etc. from additional sources, e.g., as annotations, background layers, etc.

The Hullman paper on framing effects describes an extensive collection of framing and styling techniques you can use to help frame your visualizations for promoting a specific viewpoint, story, or argument. You can also the lecture slides for ideas of specific rhetorical techniques. You are free to use any visualization techniques and rhetorical framing devices you like, but you should only create ONE main visualization for each side. (In other words, don’t make a collection of several charts to argue Yes or No, just have one for each side. However, it’s okay to inset or annotate a smaller chart within your primary chart.)

For each of the charts, include a title that's specific to that chart (this title may also be persuasive for the Yes/No position). Also add a brief caption directly below each chart that describes what the chart shows. (This caption may also help argue that chart's position or point!)

Below the two visualizations/titles/captions, add two writeups (one for the left chart, and one for the right), that describe the specific rhetorical techniques or framing effects you are using for each chart, and describe why you think they're persuasive. You should explicitly reference techniques from the lecture/paper!

## Grading 

This assignment is worth 10 points. Be sure to organize and lay out your page nicely, with nicely styled elements. Up to +2 bonus points will be considered for submissions that go above and beyond (e.g., creating particularly compelling or impressive argumentative visualizations). Extra credit points (or a lack thereof) are not reviewable based on grade appeals.

> ❗️ In previous years, students have posted this assignment as a part of their online portfolios. While we cannot prohibit you from reviewing such charts, you are not allowed to use their code, and we highly recommend not even looking at these until you submitted the assignment. Copying someone else's code/arguments is considered plagiarism.
