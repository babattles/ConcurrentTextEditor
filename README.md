# HiveText
Project Charter
Team 25 Purdue CS307 Spring 2018
George Albrecht, Arun Arjunakani, Bryan Battles, Alexander Geier, Paramesh Pradeep, Guangqi Sun

# Problem Statement
In certain collaborative situations, software developers may wish to work concurrently on various types of simple text files. These situations involve multiple users making numerous edits to the same file, that are visible to everyone. We will develop a desktop application, HiveText, that allows users to work simultaneously on any simple text file. It will be similar to existing text editors such as Sublime Text or Notepad++, and similar to other collaborative tools like git and Google Docs, but will improve upon these existing tools by allowing users to work concurrently on files while providing visual tracking of changes. A configurable consensus will be required to permanently save user changes. In addition, our application will provide users with a chat box with several channels for communication between collaborators working on the same file.

# Project Objectives
Develop a desktop application that allows users to collaborate with other users on a shared file 
Implement an interface that allows online users to accept or reject changes to the shared file through a consensus
Implement functionality to allow users to download the current version of the document
Implement a chat box where collaborators can communicate on shared files
Implement functionality for user accounts to link files to their contributors

# Stakeholders
Software Developers: 
George Albrecht
Arun Arjunakani
Bryan Battles
Alexander Geier
Paramesh Pradeep
Guangqi Sun
Users -  Developers who work in small to mid sized groups (3-50)
Development Manager - Miguel Villarreal-Vasquez
Project Owners:
George Albrecht
Arun Arjunakani
Bryan Battles
Alexander Geier
Paramesh Pradeep
Guangqi Sun    

# Deliverables
An Electron based front-end using the VueJS framework that allows users to simultaneously view and edit shared files
File storage with concurrent access using Google FireBase
User authentication with Facebook Login and/or Google Sign-in
Ability for users to accept and save a file’s pending revisions
Ability for users to save a local copy of the current file
Chat functionality allowing users with access to the same file to communicate
