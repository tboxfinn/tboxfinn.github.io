<a name="title"></a>
<p align="center"><img width=25% src="1_logo.png?raw=true"></p>

# My Development Environment Setup

## The Operating System (WINDOWS 10)
Throughout my tutorials I will be using the Windows 10 operating system, over the years it has become the environment I am most comfortable with, mostly because I am a gamer and sometimes I will take a break from programming and hop into a quick game or two. I don't think I am the only one who tends to do that ;) 

As a direct result of this, I will be tailoring my tutorials towards windows users, however, if you are using some unix environment, then [Cherno](https://www.youtube.com/watch?v=18c3MTX0PK0&list=PLlrATfBNZ98dudnM48yfGUldqGD0S4FFb) has a great set of tutorials on how to setup those environments, the rest of the tutorials (after this one) should be doable in any development environment.

## The Editor (Microsoft Visual Studio 2019)
I will be using MSVC 2019 for most of these tutorials, it is the editor with which I have the most experience using. [This is the download link](https://visualstudio.microsoft.com/downloads/) if you don't have it already.

## Setting Up A New Visual Studio Project
1. Create a new project.
<a name="new_project"></a>
<p align="left"><img width=50% src="bi_1_new_project.png?raw=true"></p>

2. Make sure that you create an empty project otherwise visual studio will create files we don't need, such as a precompiled header, we'll get to those in the future.
<a name="empty"></a>
<p align="left"><img width=50% src="bi_2_empty_project.png?raw=true"></p>

3. In order to be able to extend this solution into future tutorials, which will including linking multiple projects, deselect the option to place the solution and the project in the same directory, oh yeah, and give them different names too (as demonstrated below). Make sure to pick an appropriate location for your solution, I personally like to place it directly in a github repository under my workspace folder. 
<a name="names"></a>
<p align="left"><img width=50% src="bi_3_project_names.png?raw=true"></p>

<h1>Eureka! You've officially created the visual studio project!</h1>

## Cleaning the Project Structure
1. Initially the sandbox project you created will look something like the image below. Press the "Show All Files" option, which can be located in the solution explorer (in the red box below). 
<a name="all_files"></a>
<p align="left"><img width=50% src="bi_4_switch_mode.png?raw=true"></p>

2. Displaying all files will switch the solution explorer from dispalying file filters, to displaying the underlying file structure in your OS folder. I personally prefer this as I feel it keeps the codebase cleaner. Also, if you have any folders or files showing currently (as below), delete them, no harm will come to you.
<a name="delete_me"></a>
<p align="left"><img width=50% src="bi_5_delete_debug_file.png?raw=true"></p>

3. I like to include my C++ source files in a folder named "src", you can do that by right clicking on the sandbox project and selecting the options in the red boxes below. Doing so will also create the new folders in your file system.
<a name="new_folder"></a>
<p align="left"><img width=50% src="bi_6_add_new_folder.png?raw=true"></p>

4. Next we will change the default visual studio configurations for the compiled output, again this is to keep the codebase more organized. Start by right clicking on the sandbox project and going to properties, alternatively you should start using the msvc keybindings, so select the sandbox project and press <b>"Alt + Enter"</b>. Note, ignore the main.cpp file in the image below, we will get to that later in this post. 
<a name="properties"></a>
<p align="left"><img width=25% src="bi_9_properties_akt_enter.png?raw=true"></p>

5. Set your current configuration to "All Configurations", and the current platform to "All Platforms", we will be adding directory locations for the outputs and intermediates of the project, this way we don't have to write these for each configuration for each platform (we will write a generalized path).
<a name="all_configs"></a>
<p align="left"><img width=30% src="bi_10_all_configs.png?raw=true"></p>
<a name="all_platforms"></a>
<p align="left"><img width=50% src="bi_11_all_platforms.png?raw=true"></p>

6. Set the configurations as below. What they do is split the intermediate objects from the project binaries, and all in all, allow for an easier to traverse codebase. \$(SolutionDir) is your solution directory. \$(Platform) is the active platform being compiled to, i.e, win32 or x64. \$(Configuration) is the active configuration, i.e, debug or release.
<a name="directory_configs"></a>
<p align="left"><img width=100% src="bi_12_config_output_locations.png?raw=true"></p>

## Lets Write Our First Program!
1. Now add a "Main.cpp" file to your project as shown below.  
<a name="add_item"></a>
<p align="left"><img width=50% src="bi_7_add_new_item.png?raw=true"></p>
<a name="add_main"></a>
<p align="left"><img width=100% src="bi_8_add_cpp_main.png?raw=true"></p>

2. Copy the code below into your main file and then press "F5", this will build and run your currently active startup project (which in our case is Sandbox, since we only have a single project in our visual studio solution). What the program does I will leave for a future post, as today was just about setting the environment up.
<a name="add_main"></a>
<p align="left"><img width=50% src="bi_13_main_contents.png?raw=true"></p>

## Today's Conclusion 

 If you have done all the steps above correctly, you should now be looking at a console which displays the text "Hello World!", and upon pressing any key, it should terminate, and thanks to our initial structuring of our configurations, you should now be able to go into your filesystem, go into your project folder, and see a folder named "bin", if you go in there, you will see two more folders, "Intermediates", and either "win32" or "x64" depending on what platform you had active when you pressed "F5", if you go into the platform folder (i.e, not the intermediates one), you will see a folder with the name of the configuration you currently have active. In this folder, you will find your executable, you should be able to double click your exe in there and see the same output as before. 

## Thanks For Reading!

 That's all for today's post, future posts probably won't be as long as this one, the setup stage is usually the longest... If you're still here reading this then I guess I owe you something, for today it'll be a cool fact (atleast I found it cool), did you know that bananas are curved because they grow towards the sun? It's wierd I know, they go through a process called negative geotropism, which means that they don't grow towards the ground, but instead, they grow upwards, which means they grow against gravity, which is why they are curved.... Cya!
