{
  "targets": [{
    "target_name": "serialutil",
    "conditions": [[
      "OS == \"linux\"", {
        "cflags": [
          "-Wno-unused-local-typedefs"
        ]
      }]
    ],
    "include_dirs" : [
      "<!(node -e \"require('nan')\")"
    ],
    "sources": [
      "./src/serialutil.cc"
    ]
  }]
}

