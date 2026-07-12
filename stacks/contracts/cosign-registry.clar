;; CoSign mutual collaboration cards.

(define-constant MAX_KIND u4)
(define-constant MIN_EXPIRY_DELAY u3600)
(define-constant MAX_EXPIRY_DELAY u2592000)

(define-constant ERR_INVALID_KIND (err u400))
(define-constant ERR_INVALID_CONTEXT (err u401))
(define-constant ERR_INVALID_NOTE (err u402))
(define-constant ERR_INVALID_EXPIRY (err u403))
(define-constant ERR_SELF_TARGET (err u404))
(define-constant ERR_NOT_FOUND (err u405))
(define-constant ERR_NOT_CREATOR (err u406))
(define-constant ERR_SELF_SIGN (err u407))
(define-constant ERR_WRONG_SIGNER (err u408))
(define-constant ERR_COMPLETED (err u409))
(define-constant ERR_CANCELLED (err u410))
(define-constant ERR_EXPIRED (err u411))

(define-data-var total-handshakes uint u0)

(define-map handshakes uint {
  creator: principal,
  signer: (optional principal),
  intended-signer: (optional principal),
  kind: uint,
  context: (string-ascii 48),
  note: (string-ascii 160),
  created-at: uint,
  expires-at: uint,
  completed-at: uint,
  cancelled: bool
})

(define-map created-counts principal uint)
(define-map signed-counts principal uint)
(define-map created-ids { account: principal, index: uint } uint)
(define-map signed-ids { account: principal, index: uint } uint)

(define-public (create-handshake
    (kind uint)
    (context (string-ascii 48))
    (note (string-ascii 160))
    (intended-signer (optional principal))
    (expires-at uint)
  )
  (let (
      (id (+ (var-get total-handshakes) u1))
      (created-index (default-to u0 (map-get? created-counts tx-sender)))
    )
    (asserts! (<= kind MAX_KIND) ERR_INVALID_KIND)
    (asserts! (> (len context) u0) ERR_INVALID_CONTEXT)
    (asserts! (> (len note) u0) ERR_INVALID_NOTE)
    (asserts! (>= expires-at (+ stacks-block-time MIN_EXPIRY_DELAY)) ERR_INVALID_EXPIRY)
    (asserts! (<= expires-at (+ stacks-block-time MAX_EXPIRY_DELAY)) ERR_INVALID_EXPIRY)
    (match intended-signer target
      (asserts! (not (is-eq target tx-sender)) ERR_SELF_TARGET)
      true
    )
    (map-set handshakes id {
      creator: tx-sender,
      signer: none,
      intended-signer: intended-signer,
      kind: kind,
      context: context,
      note: note,
      created-at: stacks-block-time,
      expires-at: expires-at,
      completed-at: u0,
      cancelled: false
    })
    (map-set created-ids { account: tx-sender, index: created-index } id)
    (map-set created-counts tx-sender (+ created-index u1))
    (var-set total-handshakes id)
    (print { event: "handshake-created", id: id, creator: tx-sender,
      intended-signer: intended-signer, kind: kind, expires-at: expires-at })
    (ok id)
  )
)

(define-public (cosign (id uint))
  (match (map-get? handshakes id)
    handshake
      (begin
        (asserts! (not (get cancelled handshake)) ERR_CANCELLED)
        (asserts! (is-none (get signer handshake)) ERR_COMPLETED)
        (asserts! (< stacks-block-time (get expires-at handshake)) ERR_EXPIRED)
        (asserts! (not (is-eq tx-sender (get creator handshake))) ERR_SELF_SIGN)
        (match (get intended-signer handshake) target
          (asserts! (is-eq tx-sender target) ERR_WRONG_SIGNER)
          true
        )
        (let ((signed-index (default-to u0 (map-get? signed-counts tx-sender))))
          (map-set handshakes id (merge handshake {
            signer: (some tx-sender), completed-at: stacks-block-time
          }))
          (map-set signed-ids { account: tx-sender, index: signed-index } id)
          (map-set signed-counts tx-sender (+ signed-index u1))
          (print { event: "handshake-cosigned", id: id,
            creator: (get creator handshake), signer: tx-sender,
            completed-at: stacks-block-time })
          (ok stacks-block-time)
        )
      )
    ERR_NOT_FOUND
  )
)

(define-public (cancel-handshake (id uint))
  (match (map-get? handshakes id)
    handshake
      (begin
        (asserts! (is-eq tx-sender (get creator handshake)) ERR_NOT_CREATOR)
        (asserts! (not (get cancelled handshake)) ERR_CANCELLED)
        (asserts! (is-none (get signer handshake)) ERR_COMPLETED)
        (asserts! (< stacks-block-time (get expires-at handshake)) ERR_EXPIRED)
        (map-set handshakes id (merge handshake { cancelled: true }))
        (print { event: "handshake-cancelled", id: id, creator: tx-sender })
        (ok true)
      )
    ERR_NOT_FOUND
  )
)

(define-read-only (get-handshake (id uint))
  (match (map-get? handshakes id) handshake (ok handshake) ERR_NOT_FOUND)
)

(define-read-only (get-total) (ok (var-get total-handshakes)))

(define-read-only (get-created-count (account principal))
  (ok (default-to u0 (map-get? created-counts account)))
)

(define-read-only (get-signed-count (account principal))
  (ok (default-to u0 (map-get? signed-counts account)))
)

(define-read-only (get-created-id (account principal) (index uint))
  (match (map-get? created-ids { account: account, index: index }) id (ok id) ERR_NOT_FOUND)
)

(define-read-only (get-signed-id (account principal) (index uint))
  (match (map-get? signed-ids { account: account, index: index }) id (ok id) ERR_NOT_FOUND)
)
