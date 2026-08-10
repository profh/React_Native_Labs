Lab 2
	File naming: PascalCase.tsx filenaming is standard
	Semicolons for readability?

Models

Controllers

Views
	1. Move "This is roughly what your simulator should look like at this point:" to subsection 2.

Render Error
The render error is being thrown by react-native-gesture-handler v 3.x, downgrading to 2.31.2 fixes this error.
"dependencies": {
    ...
    "react-native-gesture-handler": "^2.31.2"
  }

Other notes:
Should each lab follow a consistent outline like 
Part 1 -> 
	1., 2., etc... 

 or keep each lab as is?