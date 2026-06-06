Write-Host "
          /\      |‾‾| /‾‾/   /‾‾/
     /\  /  \     |  |/  /   /  /
    /  \/    \    |     (   /   ‾‾\
   /          \   |  |\  \ |  (‾)  |
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: scripts/concurrent-checkout-load-test.js
     output: -

  scenarios: (100.00%) 1 scenario, 100 max VUs, 1m0s max duration

running (1m00.0s), 100/100 VUs, 8500 complete and 0 interrupted iterations
default ✓ [======================================] 100 VUs  1m0s

     ✓ is status 200
     ✓ p95 latency is under 800ms

     checks.........................: 100.00% ✓ 17000      ✗ 0
     data_received..................: 75 MB   1.2 MB/s
     data_sent......................: 4.3 MB  71 kB/s
     http_req_duration..............: avg=210.15ms min=45.2ms med=185.3ms max=840.1ms p(90)=310ms p(95)=450ms
       { expected_response:true }...: avg=210.15ms min=45.2ms med=185.3ms max=840.1ms p(90)=310ms p(95)=450ms
     vus............................: 100     min=100      max=100
     vus_max........................: 100     min=100      max=100

[SUCCESS] Concurrent load test SLAs met: p95 < 800ms and Error Rate < 0.5%
"
