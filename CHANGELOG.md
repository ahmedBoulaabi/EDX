#### 0.1.1 (2024-05-27)

##### New Features

* **seance:**
  *  Ability to input seat number while taking presence ([9b55c237](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/9b55c2371ad4e327b919bacbb512feb79478242f))

#### 0.1.7 (2024-05-23)

##### New Features

* **seance:**
  *  Added key control for presence ([16316ff4](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/16316ff41afc636bf6ccb462896429d828383b65))
  *  Presence Modal ([57aa13d8](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/57aa13d812e01753eef0b29a6122feecd6f485f5))
  *  Display seating from db ([89c2ece0](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/89c2ece0ed03b36229eacecb4db4543d66aa8114))
  *  Save student seating in the database ([0c431d2f](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/0c431d2fd84ac2a23c45754489fe54476fc0d2d4))
* **planner:**
  * delete row ([81f07f96](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/81f07f96e13b2c0f1057f7be4134529830d0c88e))
* **student:**
  *  Implement Read profil functionality and added new tables in DB ([fe642fa7](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/fe642fa7d30dd80505a10f8fe1cc356aa5bf32f1))
  *  profil version beta front end ([48c4aea7](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/48c4aea765c4a8ce797d4d0be5f04ef4b6fa5849))
  *  enrollment form version beta front end ([740e5618](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/740e56181d0346cf3e052706d4d4b44b66fa6032))


##### Bug Fixes

* **teacher:**
  *  Fixed student addition by CSV to create entry in students table ([c65ba485](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/c65ba485af18a84a6e7f29c41853c7390735af1f))
* **seance:**  Improved UX and made the seance viewer responsive on mobile ([71243840](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/7124384094b7e100e899d7ee47fd52eabd93fdf9))


##### Other Changes

* **student:**  Implement complete CRUD functionality , add profil image and fix front end ([a2d11f18](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/a2d11f18cf84bbbe5a49cd35fe77d352425f9fe8))

#### 0.1.6 (2024-05-20)

##### New Features

- **seance:**
  - set student's seat ([debca259](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/debca25932c3e0525f9114857cba0999466a63c8))
  - Created the dynamic seance viewer, fetches and displays the classroom plan aswell as the students associated with the seance ([1383fceb](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/1383fcebd124b0b72c8f2c2eb28185f4d3c95c56))
- **timeline:**
  - Dynamically updating course start and end dates when moving the course around ([f1582c50](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/f1582c502db78215330d1bb2c5034fc8ff21f8a4))

##### Bug Fixes

- **timeline:**
  - recalculate courses start and end dates upon intercontainer exchange ([ebe14318](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/ebe1431842ee9a19e1950aef55f5d2d6677578f8))
- **teacher:** handling errors for importing student from csv file ([0b487609](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/0b487609ce384a61db4b03820b0396d1894db34c))
- **global:**
  - fixed building error arising from reset password ([31939d72](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/31939d72ad6b4ef8e09d567b0506659df203ec5d))

#### 0.1.5 (2024-05-16)

##### New Features

- **timeline:**
  - Month Selector ([a880018a](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/a880018a30f78f7836832471df2f853afc5d73dd))
  - Pagination buttons now work ([36762e56](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/36762e5632ca8d823cfb4d097d02cdff8f1cfc42))
  - Added search params / search queries to control week, month and year in an intuitive way ([38dc9879](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/38dc9879a719960b7594eb018790e9abce0d8f5d))
- **teacher:**
  - Timeline now pulls schedule from DB, refactored timeline code and made it more dynamic ([ec966b80](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/ec966b80f601cd63cfd8eefdcdff6ec282126643))
  - Created teacher schedule timeline page base front-end ([0db469dd](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/0db469ddd1ffc20b5576353ca14337e92e2f6d9a))
- **planner:**
  - Save room plan to database ([8b0cb23e](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/8b0cb23e7ace56ee543feed9f38addd9efebca99))
  - Generate plan using number of rows and seats ([b6470d17](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/b6470d17bb0721f7a7960b2330326d3d044c47a6))
- **global:**
  - Implement reset password functionality ([d7450914](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/d7450914ac966e55da0d90e9db9bc4accafa41bb))
- **School-year:**
  - Implement complete CRUD functionality ([fadf001e](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/fadf001e74774f14821b387d59a53ee65f34d7a8))
  - Implement add functionality ([fb91d73c](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/fb91d73c38bd69d06ce33c08eca6c1219bbb819a))

##### Bug Fixes

- **timeline:**
  - Fixed issue with new data fetching upon spamming the change interval chevrons ([0bbcea42](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/0bbcea42da17af833de7bf427eb002c46b672968))
  - fixed courses schema, fixed courses types, refactored some code ([cec1334c](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/cec1334c39d3e85d6219bb983c0ed335358f0c96))

#### 0.1.4 (2024-05-10)

##### New Features

- **planner:**
  - Ability to delete a seat ([50869ec2](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/50869ec2d099422e81a7cdce5acb17621d46123d))
  - Auto-name all seats, and some refactoring ([de7c6743](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/de7c67435126879d11ba61854e51658a0a257422))
  - Made the canvas infinit,added ability to zoom, pan and move around in the canvas using d3 ([21711ea9](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/21711ea95b2a193e5cb250718dd3ce11fd935fad))
  - Added dynamic RowWithSeats Block component that can be initiated with any number of seats, The icon is also dynamic and adapts to any number of seats ([644ee4e1](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/644ee4e187fd088c020f737063b3a839a9ea453d))
- **Courses:** Implement complete CRUD functionality ([38bc8903](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/38bc89038739976f85af33d60b4bf167cc394d1e))
- **studentType:** Implement complete CRUD functionality ([2a53d42e](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/2a53d42e06a9c1d27c69d3a5ec37060a68caa28a))
- **programs:** Implement complete CRUD functionality ([6a75120c](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/6a75120ce58884f075787201684ef29f41ae4bb3))

##### Bug Fixes

- **planner:**
  - made the seat auto naming more responsive ([686debb0](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/686debb028ad9b6ce6523ba48dabba0a11a690e0))
  - Changing Row Name ([4eb40993](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/4eb409934b375a8a7ae555c9e5160984df7a05b8))
  - Fixed RowUtils sharing the same cards ([5e08e981](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/5e08e981f88cf76e742989d35c5f8f7219babec8))

#### 0.1.3 (2024-05-06)

##### New Features

- **planner:**
  - Added editable names for Row blocks, Added global state management using JOTAI and atoms, cleaned up some of the code and added types to blocks, added ability to hide or show block names on canvas ([db67246e](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/db67246e6c40c049d719b71dbbc8243c6d474f90))

#### 0.1.2 (2024-05-05)

##### New Features

- **planner:**
  - Seat Drag n Drop inside RowUtil (Draggable in Draggable-Droppable), And Dynamic State management for the Planner ([8c3bfd88](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/8c3bfd8813175c1083625a2ccf861f7adb27790a))
- **global:**
- **global:**
  - Created the Room Planning page, Updated the Navigation links, Added More Cards to the Admin General dashboard ([ab442e88](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/ab442e8852d23e0535b8d71477c2d21caaae08af))

##### Bug Fixes

- **teacher/student:**
  - Implement complete CRUD functionality ([ddca606c](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/ddca606c23386569b0f47bf1c326489291e37319))
  - deletion and modify modal fixed ([d32dbfff](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/d32dbfff0d4a88ab0dddab4b3ede81effa35bad6))

##### Other Changes

- **teacher/student:** Implementing deletion and modification functionalities for teachers and students ([bf32273e](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/bf32273ebd9102b2786674883d7c0edc63828836))

#### 0.1.1 (2024-05-04)

##### Chores

- Added script to clean up the changelog ([355de155](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/355de15548b0e2ce3c747093fb2a8ed936c38909))

##### New Features

- **admin:**
  - Updated the general management page to fetch data from db ([a1ab3e88](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/a1ab3e88b70a6b913676a1fa519d0cf57ac26df7))
  - Created General platform management page, Created Program, Course, SchoolYear and StudentType Tables and Forms ([78f5155b](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/78f5155be016bfc163f50d5f67d991b4efddcae1))
- **global:**
  - Added dynamic submenu's to the navigation ([9d1a48b5](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/9d1a48b5874595a3ceb392772579fb675611a28a))
  - Quick nav on home page ([59b96e75](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/59b96e75fb31ceaf2471e437d8e1ef54fa0d959d))

##### Bug Fixes

- **global:**
  - Fixed drizzle fetching erroneous data ([926b32f5](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/926b32f55a6ed1f64d194a434772bf384a73e790))

### 0.1.0 (2024-05-02)

##### New Features

- **teacher:**
  - Added mass student creation using CSV file ([010938b5](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/010938b5deff154233b7e365e629f75c35e1bf06))
- **global:**
  - Wrote Password Generation util and integrated it into the User creation forms ([f560e674](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/f560e674e709dce2c4fe13a307bfacb3715f5113))
  - Updated Supabase integration ([b385fa60](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/b385fa60b046580bcef8458a7c018f795a243178))
  - Dynamic header links based on user role ([652fc730](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/652fc7306dbc5d715a1f97e0ed35ecd95615ca95))
  - Wrote get session util ([22f3d948](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/22f3d9489c9357fd7d90a37d1df8c4a4cc2fcff1))
- **admin:**
  - Added functionality to fetch and display the teachers list in the Admin Dashboard ([02bc4d9a](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/02bc4d9a9492ed05db89ece3ebc9be03afcb6c5c))

##### Bug Fixes

- **global:**
  - Fixed User Creation, Fixed session handling ([29149838](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/2914983876b197db0c8123e02209e9d0223d0a25))

##### Other Changes

- **admin:** Implement optional parameters handling in addTeacher and addUser function ([08c98f19](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/08c98f19115051cef7c5cd4e1e9f5b9ff557768f))

#### 0.1.0 (2024-05-01)

##### Chores

- Added changelog using generate\*changelog package ([ebd78eca](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/ebd78eca0c4f5845f24c9058c43daebebb4dc956))

##### New Features

- **admin:**
  - Add teacher formulaire logic ([064b19a9](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/064b19a9bb064236e4e16a7835ebc683517232e1))
  - Created admin dashboard page And created AddTeacher Modal ([b8bf63e7](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/b8bf63e781f30fbb300c1714bac434fa4b0d857c))
- **global:**
  - Integrated Role Based Access Control ([bd39917a](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/bd39917a3af005d92403ae53fdfbe6e84c354442))
  - Added supabase utils ([1dd1c405](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/1dd1c40508b86f7ac3fc1dcb7dcc999694b3a391))
  - Add user to the Users table upon sign up ([f1acaad3](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/f1acaad37c71856d2add38acc125e1464103cb96))
  - Added Queries and Mutations base files ([15da3d73](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/15da3d73cb98d9bf033387ebf17990c40134d0fd))
  - Added Supabase User Provider ([33a7d988](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/33a7d988a6d49c546b8107fb1ed12a514d5d3498))
  - Implemented user registration with email verification flow ([866fbb27](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/866fbb275ee6a4670b678d5f8ebef6f158eda043))
  - Implemented user login functionality ([e1a4376f](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/e1a4376f0a9662aa955e8cfcc1a68b304a0d1237))
  - Created Signup Page and Improved Login Page ([81f6d284](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/81f6d2849f2a0c776e14bd0abd98261ab5372b06))
- **teacher:** Created Teacher dashboard page And created AddStudent Modal ([df704f73](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/df704f73672853e532946b24d38a1fa00c3eb081))
- Admin and Teacher Dashboard pages ([86894fcc](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/86894fcc567f35651337d3cb779135e2241aaa43))
- Configure database schema and setup Drizzle with Supabase integration ([d3c1fac5](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/d3c1fac57fb7ff82676318cec59d297b66367b24))
- Added a user dropdown to the header and fixed header responsiveness ([9994c735](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/9994c735fdeed66ee784fd640b61e60223c1978d))

##### Bug Fixes

- **global:**
  - Enhance role\*based access control for middleware ([d8f3a52d](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/d8f3a52d03bb4630c2b4a5ed054f140573a7ff60))
  - Register logic ([0f031d34](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/0f031d34d69a1b820b24a37fe6895497f34487c8))
- **general:**
  - Fixed Login and Signup breaking the app due to errors not being formatted correctly from db ([8a3b6a01](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/8a3b6a012d8972b066eb557aaf2bca33172740b1))
  - Fixed Navbar links on mobile ([93c11caa](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/93c11caa32c9d516369e2b36e698898a67200a36))

#### 0.1.0 (2024-04-30)

##### New Features

- **global:**
  - Created Login Page and improved the Header Component ([6c809575](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/6c8095752cde2c56ded8a9d1c55dcf21dd1f0ec1))
  - Created Header Component ([2aedac85](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/2aedac85e220c91a6cf08e5f8fd1fb5131d7d117))

##### Other Changes

- Added brand color presets to tailwind and tiling svg background ([815b1148](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/815b1148bb12a24b852ac1bcd3a6624de68d623e))
- Added Favicon and Metadata ([77ebe070](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/77ebe070896796f7203ea49f1ae09d5706587d3b))
- Added Shadcn UI components package ([e41e2c32](https://github.com/uha-fr/endyearproject_2024_teacher-assistant_01/commit/e41e2c32e8062ce9ad1e76b758f3d444fbcbc674))
