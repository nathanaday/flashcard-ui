# Networking Exam Review Guide

### 1

> Subnetting is the process of extracting the network address from an IP address

**Answer: False**

Subnetting is the process of dividing a single network into smaller sub-networks by borrowing bits from the host portion of the address. Extracting the network address from an IP address (by ANDing the address with the subnet mask) is a separate operation that uses the result of subnetting, not subnetting itself.

### 2

> TCP has the property of slow start to probe the congestion level in the network

**Answer: True**

Slow start begins with a small congestion window (typically 1 MSS) and grows it exponentially with each RTT until either a loss is detected or the slow start threshold is reached. This lets TCP discover the available bandwidth without immediately overwhelming the network.

### 3

> The MTU is the maximum number of Bytes that the IP packet can encapsulate

**Answer: False**

The MTU (Maximum Transmission Unit) is the maximum size of the entire IP packet (including the IP headers), which represents the maximum payload that the Data Link layer frame (like an Ethernet frame) can encapsulate. It is not the maximum number of bytes that the IP packet itself can encapsulate.

### 4

> Communications can be initiated either from the private network or from the public network, as long as the private network is using a NAT mechanism.

**Answer: False**

With standard NAT, communications can typically only be initiated from the private network outward to the public network. The NAT device creates a translation entry when an internal host sends a packet out, which then allows return traffic to flow back to that host.


### 5

> The following masks (in slash notation for simplicity) are only used as default masks: /8, /16 and /24

**Answer: True (answer key, but contested - False is acceptable)**

The intended reading refers to classful addressing: Class A defaults to /8, Class B to /16, and Class C to /24. These are the only masks that serve as classful defaults. The phrase "are only used as" is ambiguous though — read literally, it implies these masks are *exclusively* used as defaults, which is clearly false since /24 appears constantly in subnetted networks unrelated to class defaults.

### 6

> In link state routing, every router has exactly the same link state database but the routing tables are different in each router.

**Answer: True**

Link state protocols (OSPF, IS-IS) flood topology information so every router builds an identical link state database. Each router then independently runs Dijkstra's algorithm with itself as the root, producing a different shortest-path tree and therefore a different routing table.

### 7

> In distance vector routing, each router receives distance vectors from every router in the network.

**Answer: False**

In distance vector routing, a router only exchanges distance vectors with its **direct neighbors**. It never sees vectors from distant routers directly. Information about far-away destinations propagates indirectly, hop by hop, through neighbor exchanges.

### 8

> In 802.11 CSMA/CA, when a station senses the medium to be idle it sends a frame immediately.

**Answer: False**

When the medium is sensed idle, the station must wait a DIFS interval and then enter a random backoff period before transmitting. This avoids collisions when multiple stations have been waiting for the medium to clear.

### 9

> 802.11 and 802.3 have the same frame format but they differ in the sense that 802.11, acknowledgements are needed since a sending station can't detect a collision.

**Answer: False**

The acknowledgement reasoning is correct, but the claim that the frame formats are the same is wrong. 802.11 frames have a more complex header with up to four MAC address fields, a frame control field, and sequence control information that 802.3 doesn't include. Since one half of a compound statement is false, the whole statement is false.

### 10

> In 802.11, when two stations transmit RTS frames simultaneously, a collision will occur and no CTS frame is received. Each station will wait a random period of time and try again.

**Answer: True**

When the access point receives garbled RTS frames due to collision, it sends no CTS. Each station, after timing out waiting for the CTS, doubles its contention window and picks a new random backoff value, then retries.

### 11

> An ACK number of 500 in the TCP header, indicates that the receiver has received 499 Bytes, and the next byte it expects to receive is #500

**Answer: False**

The "next expected byte is #500" part is correct, but "499 bytes received" is wrong because TCP sequence numbers don't start at 0 — they start at a random Initial Sequence Number chosen during connection setup. The actual byte count depends on the ISN, not on the absolute ACK value.

### 12

> The maximum window size in TCP is limited by the round-trip time RTT of the connection

**Answer: False**

The maximum window size is limited by the size of the window field in the TCP header (16 bits, or 65,535 bytes without window scaling). RTT affects throughput by determining how quickly ACKs return, but it doesn't cap the window size itself.

### 13

> If an IP fragment does not arrive at the destination, then only that fragment, not the entire packet, is retransmitted by the source host

**Answer: False**

IP itself doesn't track fragments or perform retransmission. If a fragment is lost, the destination cannot reassemble the packet and discards everything that did arrive. Retransmission, if it happens at all, is handled by the upper layer (typically TCP) and would resend the entire segment, which gets re-fragmented from scratch.

### 14

> The IP header changes each time a packet passes through an IP router

**Answer: True**

Every router decrements the TTL field, which forces the header checksum to be recalculated. Other fields like fragmentation flags or the source MAC at the link layer may also change depending on the path.

### 15

> In 802.11, sending an ACK after SIFS prevents a collision with a potential data frame transmission, since other nodes will wait for DIFS time units before attempting a transmission

**Answer: False**

The mechanism described is real and works most of the time — SIFS being shorter than DIFS does give ACKs priority. The issue is the word "prevents." Hidden terminals and other edge cases can still cause collisions despite the timing priority. The mechanism reduces collision probability rather than eliminating it.

### 16

> After fast retransmit is invoked, fast recovery cuts the slow start period in half

**Answer: False**

Fast recovery doesn't shorten slow start — it skips slow start entirely. After fast retransmit, the sender halves ssthresh, sets cwnd to ssthresh + 3, and goes directly into congestion avoidance (linear growth). What gets halved is ssthresh, not the duration of slow start.

### 17

> In 802.3 standard, if the maximum size (coverage) were increased, the minimum frame size would decrease.

**Answer: False (Answer key, contested, True can be justified)**

Under the formula minimum_frame_size ≥ 2 × propagation_delay × bandwidth, increasing the cable length increases propagation delay, which means the minimum frame size needed for collision detection would *increase*, not decrease. So False is correct under that reading. The contested interpretation depends on whether you treat the minimum frame size as the fixed 64-byte standard value (which doesn't change at all) or as the theoretical minimum for collision detection.

### 18

> In 802.3 standard, if the bandwidth were decreased, the minimum frame size would decrease as well.

**Answer: False (Answer key, contested, True can be justified)**

Under the same formula used for question 17, decreasing bandwidth means a smaller minimum frame size is sufficient for collision detection — so True is justifiable and consistent with the reasoning expected for question 17. The answer key may be treating the minimum frame size as the fixed 64-byte standard value, which doesn't change with bandwidth, but that reading is inconsistent with how question 17 is graded.

### 19

> In 802.3, if an ACK is not received within a specified time (timeout) the sender will retransmit the frame.

**Answer: False**

802.3 (wired Ethernet) doesn't use ACKs at all. Reliability is left to upper layers like TCP. The ACK-and-timeout mechanism applies to 802.11 (wireless), not 802.3.

### 20

> In the case fragmentation is needed, the TCP/UDP headers always end up in the first fragment.

**Answer: True**

IP fragments a packet starting from the beginning, and the TCP or UDP header sits at the very start of the IP payload. So the transport-layer header always lands in the first fragment, with subsequent fragments carrying only data.

### 21

> Host A (The Client) initiates a TCP session with host B (The server). The connection setup 3-way handshaking include SYN, SYN-ACK and ACK respectively. Host A can start sending data immediately after sending the ACK segment where as Host B can send some data immediately after sending the SYN-ACK segment to the client.

**Answer: False**

Host A can piggyback data with the final ACK or send immediately after, which is correct. But Host B cannot send data with the SYN-ACK — the connection isn't fully established from B's perspective until B receives the final ACK from A. B has to wait.

### 22

> A smart phone can spread traffic to/from a single TCP connection over the WiFi and Cellular interfaces at the same time.

**Answer: False**

Standard TCP connections are bound to a single IP address per endpoint, so a single connection uses one interface at a time. Multipath TCP (MPTCP) can spread a connection across interfaces, but it's not the default behavior of standard TCP.

### 23

> Which statement describes remote access VPNs? Select all that applies
> a. Client software is usually required to be able to access the network.
> b. Remote access VPNs are used to connect entire networks, such as a branch office to headquarters.
> c. Remote access VPNs support the needs of telecommuters and mobile users
> d. A leased line is required to implement remote access VPNs.
> e. End users are not aware that VPNs exists.

**Answer: A, C**

Remote access VPNs connect individual users to a network and typically require client software (A) to support telecommuters and mobile users (C). Option B describes site-to-site VPNs. VPNs run over the public internet, not leased lines (D). End users generally know they're using a VPN since they have to connect to it (E).

### 24

> If a TCP flow and a UDP flow share the same "bottleneck" in the network. Which of the following is "more likely" to be true?
> a. UDP connection will get a greater percentage of the bandwidth than TCP
> b. TCP connection will get a greater percentage of the bandwidth than UDP
> c. Both TCP and UDP connections will be affected equally by the network congestion
> d. TCP will continue because it is reliable but UDP will stop
> e. Both connections will terminate

**Answer: A**

When a bottleneck saturates, TCP reacts to packet loss by halving its congestion window and slowing down. UDP has no congestion control and continues sending at its application rate. Over time, TCP's repeated backoff frees bandwidth that UDP captures, so UDP gets a larger share. This is a foundational result and the reason "TCP-friendliness" is a concern in network design.

### 25

> A sender sends an unencrypted message and its encrypted digest over a network. Which of the following types of information assurance is provided in this scenario?
> a. Confidentiality
> b. Authentication
> c. Integrity
> d. None of the above

**Answer: C**

The message is unencrypted, so no confidentiality. The encrypted digest (a hash) lets the recipient verify the message hasn't been altered, providing integrity. Authentication isn't established without knowing whose key encrypted the digest.

### 26

> A sender sends a message encrypted by a public key of the recipient. Which of the following is NOT provided in this scenario?
> a. Confidentiality
> b. Integrity
> c. Authentication
> d. None of the above

**Answer: C**

Encrypting with the recipient's public key means only the recipient's private key can decrypt — that gives confidentiality. But anyone could have used the public key to encrypt, so there's no way to verify who the sender is. Authentication is missing.

### 27

> A sender sends a message encrypted by his own private key. Which of the following is NOT provided in this scenario?
> a. Confidentiality
> b. Integrity
> c. Authentication
> d. All of the above

**Answer: A**

Anyone with the sender's public key (which is everyone) can decrypt the message, so confidentiality is missing. Authentication is provided because only the sender holds the private key. This is the basic operation behind digital signatures.

### 28

> Replacing a Hub by a switch results in (Select all that applies)
> a. It increases the number of collision domains.
> b. It decreases the number of collision domains.
> c. It increases the number of broadcast domains.
> d. It decreases the number of broadcast domains.
> e. It makes smaller collision domains.
> f. It makes larger collision domains.

**Answer: A, E**

A hub creates one shared collision domain across all ports. A switch isolates each port into its own collision domain, increasing the count and shrinking each one to a single port. Both hubs and switches forward broadcasts the same way, so the number of broadcast domains is unchanged.

### 29

> An ISP advertises the CIDR network address 192.168.3.48/20 (and no other addresses). What network addresses could this ISP own? (Select all that applies)
> a. 192.168.3.128
> b. 192.168.3.49
> c. 192.168.3.64
> d. 192.168.3.1
> e. 192.168.3.62

**Answer: B, E**

A /20 covers the range 192.168.0.0 through 192.168.15.255. All five options fall within that range numerically, but the question asks which addresses the ISP "could own" as host addresses. Options B (.49) and E (.62) are valid host addresses within the advertised block. The other options either represent subnet boundaries or addresses with different alignment that wouldn't typically be assigned individually.

### 30

> A network administrator discovers that host A is having trouble with Internet connectivity, but the server farm has full connectivity. In addition, host A has full connectivity to the server farm. What is a possible cause of this problem? (Diagram shows host A at 172.24.24.33/24 connecting through a router to a Server Farm at 209.165.200.224/27 and out to the Internet.)
> a. NAT is required for the host A network.
> b. Host A has an incorrect subnet mask.
> c. Host A has an incorrect default gateway configured.
> d. The router has an incorrect gateway.
> e. Host A has an overlapping network address.

**Answer: A**

Host A uses 172.24.24.33/24, which is part of the RFC 1918 private address range (172.16.0.0/12). Private addresses are not routable on the public internet, so host A needs NAT to translate its private address to a public one before traffic can reach the Internet. Connectivity to the server farm works because that's internal routing, but reaching outside requires NAT.

