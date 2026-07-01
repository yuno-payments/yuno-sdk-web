import UIKit

/**
 * MainViewController - Entry point for the iOS app.
 *
 * This view controller allows the user to input their Yuno configuration JSON,
 * then navigates to React Native which initializes the Yuno SDK.
 *
 * Similar to Android's MainActivity, this controller:
 * 1. Parses the configuration JSON
 * 2. Validates the JSON structure
 * 3. Navigates to React Native view with the configuration
 * 4. React Native initializes the SDK using @yuno/yuno-sdk-react-native
 *
 * The JSON should contain:
 * - country: Country code
 * - language: Language code
 * - currency: Currency code
 * - amount: Amount
 * - merchantKeys: { publicKey, secretKey, accountCode }
 * - options: { showPaymentStatus, savedCardEnable }
 */
class MainViewController: UIViewController, UITextViewDelegate {
    
    // MARK: - UI Components
    private let scrollView = UIScrollView()
    private let contentView = UIView()
    private let headerView = UIView()
    private let titleLabel = UILabel()
    private let subtitleLabel = UILabel()
    private let cardView = UIView()
    private let cardTitleLabel = UILabel()
    private let instructionsLabel = UILabel()
    private let configTextView = UITextView()
    private let startButton = UIButton()
    private let infoCard = UIView()
    private let infoTitleLabel = UILabel()
    private let infoTextLabel = UILabel()
    private let footerLabel = UILabel()
    
    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        setupConstraints()
        setupKeyboardHandling()
    }
    
    // MARK: - Setup
    private func setupUI() {
        // Configure scroll view
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scrollView)
        
        // Configure content view
        contentView.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(contentView)
        
        // Configure background color (adapts to theme)
        if #available(iOS 13.0, *) {
            view.backgroundColor = UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor(red: 0.18, green: 0.18, blue: 0.21, alpha: 1.0) : // grey_1 dark
                    UIColor(red: 0.96, green: 0.97, blue: 0.98, alpha: 1.0)  // grey_1 light
            }
        } else {
            view.backgroundColor = UIColor(red: 0.96, green: 0.97, blue: 0.98, alpha: 1.0)
        }
        
        // Configure header
        headerView.translatesAutoresizingMaskIntoConstraints = false
        if #available(iOS 13.0, *) {
            headerView.backgroundColor = UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor(red: 0.16, green: 0.16, blue: 0.19, alpha: 1.0) : // #282A30
                    UIColor.white
            }
        } else {
            headerView.backgroundColor = UIColor.white
        }
        contentView.addSubview(headerView)
        
        // Configure title
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        titleLabel.text = "🎯 Yuno SDK Example"
        titleLabel.font = UIFont.boldSystemFont(ofSize: 28)
        if #available(iOS 13.0, *) {
            titleLabel.textColor = UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor.white :
                    UIColor(red: 0.16, green: 0.16, blue: 0.19, alpha: 1.0) // neutral_b
            }
        } else {
            titleLabel.textColor = UIColor(red: 0.16, green: 0.16, blue: 0.19, alpha: 1.0)
        }
        titleLabel.textAlignment = .center
        headerView.addSubview(titleLabel)
        
        // Configure subtitle
        subtitleLabel.translatesAutoresizingMaskIntoConstraints = false
        subtitleLabel.text = "📱 iOS"
        subtitleLabel.font = UIFont.systemFont(ofSize: 16)
        if #available(iOS 13.0, *) {
            subtitleLabel.textColor = UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor.white.withAlphaComponent(0.9) :
                    UIColor(red: 0.16, green: 0.16, blue: 0.19, alpha: 0.9) // neutral_b with alpha
            }
        } else {
            subtitleLabel.textColor = UIColor(red: 0.16, green: 0.16, blue: 0.19, alpha: 0.9)
        }
        subtitleLabel.textAlignment = .center
        headerView.addSubview(subtitleLabel)
        
        // Configure card view
        cardView.translatesAutoresizingMaskIntoConstraints = false
        if #available(iOS 13.0, *) {
            cardView.backgroundColor = UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor(red: 0.12, green: 0.13, blue: 0.14, alpha: 1.0) : // neutral_w dark
                    UIColor.white
            }
        } else {
            cardView.backgroundColor = UIColor.white
        }
        cardView.layer.cornerRadius = 16
        cardView.layer.borderWidth = 1
        if #available(iOS 13.0, *) {
            cardView.layer.borderColor = UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor(red: 0.47, green: 0.49, blue: 0.52, alpha: 1.0) : // grey_3 dark
                    UIColor(red: 0.75, green: 0.76, blue: 0.78, alpha: 1.0) // grey_3 light
            }.cgColor
        } else {
            cardView.layer.borderColor = UIColor(red: 0.75, green: 0.76, blue: 0.78, alpha: 1.0).cgColor
        }
        cardView.layer.shadowColor = UIColor.black.cgColor
        cardView.layer.shadowOpacity = 0.1
        cardView.layer.shadowOffset = CGSize(width: 0, height: 4)
        cardView.layer.shadowRadius = 8
        contentView.addSubview(cardView)
        
        // Configure card title
        cardTitleLabel.translatesAutoresizingMaskIntoConstraints = false
        cardTitleLabel.text = "⚙️ Configuration"
        cardTitleLabel.font = UIFont.boldSystemFont(ofSize: 18)
        if #available(iOS 13.0, *) {
            cardTitleLabel.textColor = UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor.white :
                    UIColor(red: 0.16, green: 0.16, blue: 0.19, alpha: 1.0) // neutral_b
            }
        } else {
            cardTitleLabel.textColor = UIColor(red: 0.16, green: 0.16, blue: 0.19, alpha: 1.0)
        }
        cardView.addSubview(cardTitleLabel)
        
        // Configure instructions
        instructionsLabel.translatesAutoresizingMaskIntoConstraints = false
        instructionsLabel.text = "Yuno Configuration JSON:"
        instructionsLabel.font = UIFont.boldSystemFont(ofSize: 14)
        if #available(iOS 13.0, *) {
            instructionsLabel.textColor = UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor.white :
                    UIColor(red: 0.16, green: 0.16, blue: 0.19, alpha: 1.0)
            }
        } else {
            instructionsLabel.textColor = UIColor(red: 0.16, green: 0.16, blue: 0.19, alpha: 1.0)
        }
        cardView.addSubview(instructionsLabel)
        
        // Configure text view
        configTextView.translatesAutoresizingMaskIntoConstraints = false
        configTextView.accessibilityIdentifier = "config-text-input"
        configTextView.font = UIFont.monospacedSystemFont(ofSize: 12, weight: .regular)
        if #available(iOS 13.0, *) {
            configTextView.backgroundColor = UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor(red: 0.12, green: 0.13, blue: 0.14, alpha: 1.0) : // grey_0 dark
                    UIColor(red: 0.99, green: 0.99, blue: 1.0, alpha: 1.0)  // grey_0 light
            }
            configTextView.textColor = UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor.white :
                    UIColor(red: 0.16, green: 0.16, blue: 0.19, alpha: 1.0)
            }
        } else {
            configTextView.backgroundColor = UIColor(red: 0.99, green: 0.99, blue: 1.0, alpha: 1.0)
            configTextView.textColor = UIColor(red: 0.16, green: 0.16, blue: 0.19, alpha: 1.0)
        }
        configTextView.layer.cornerRadius = 12
        configTextView.layer.borderWidth = 1
        if #available(iOS 13.0, *) {
            configTextView.layer.borderColor = UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor(red: 0.21, green: 0.21, blue: 0.24, alpha: 1.0) : // grey_2 dark
                    UIColor(red: 0.93, green: 0.94, blue: 0.95, alpha: 1.0) // grey_2 light
            }.cgColor
        } else {
            configTextView.layer.borderColor = UIColor(red: 0.93, green: 0.94, blue: 0.95, alpha: 1.0).cgColor
        }
        configTextView.textContainerInset = UIEdgeInsets(top: 16, left: 16, bottom: 16, right: 16)
        configTextView.delegate = self
        configTextView.isScrollEnabled = true
        configTextView.text = "Enter the configuration JSON"
        if #available(iOS 13.0, *) {
            configTextView.textColor = UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor(red: 0.61, green: 0.63, blue: 0.65, alpha: 1.0) : // grey_4 dark (hint)
                    UIColor(red: 0.57, green: 0.58, blue: 0.61, alpha: 1.0)  // grey_4 light (hint)
            }
        } else {
            configTextView.textColor = UIColor(red: 0.57, green: 0.58, blue: 0.61, alpha: 1.0)
        }
        cardView.addSubview(configTextView)
        
        // Configure start button
        startButton.translatesAutoresizingMaskIntoConstraints = false
        startButton.accessibilityIdentifier = "button-start-sdk"
        startButton.setTitle("Start Yuno SDK Example", for: .normal)
        startButton.titleLabel?.font = UIFont.boldSystemFont(ofSize: 15)
        if #available(iOS 13.0, *) {
            startButton.backgroundColor = UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor.white :
                    UIColor(red: 0.16, green: 0.16, blue: 0.19, alpha: 1.0) // neutral_b
            }
            startButton.setTitleColor(UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor(red: 0.12, green: 0.13, blue: 0.14, alpha: 1.0) : // neutral_w dark
                    UIColor.white
            }, for: .normal)
        } else {
            startButton.backgroundColor = UIColor(red: 0.16, green: 0.16, blue: 0.19, alpha: 1.0)
            startButton.setTitleColor(UIColor.white, for: .normal)
        }
        startButton.layer.cornerRadius = 12
        startButton.contentEdgeInsets = UIEdgeInsets(top: 16, left: 16, bottom: 16, right: 16)
        startButton.addTarget(self, action: #selector(startButtonTapped), for: .touchUpInside)
        cardView.addSubview(startButton)
        
        // Configure info card
        infoCard.translatesAutoresizingMaskIntoConstraints = false
        if #available(iOS 13.0, *) {
            infoCard.backgroundColor = UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor(red: 0.10, green: 0.14, blue: 0.26, alpha: 1.0) : // info_background dark
                    UIColor(red: 0.89, green: 0.93, blue: 1.0, alpha: 1.0)   // secondary_1
            }
        } else {
            infoCard.backgroundColor = UIColor(red: 0.89, green: 0.93, blue: 1.0, alpha: 1.0)
        }
        infoCard.layer.cornerRadius = 16
        infoCard.layer.borderWidth = 4
        infoCard.layer.borderColor = UIColor(red: 0.03, green: 0.42, blue: 1.0, alpha: 1.0).cgColor
        contentView.addSubview(infoCard)
        
        // Configure info title
        infoTitleLabel.translatesAutoresizingMaskIntoConstraints = false
        infoTitleLabel.text = "ℹ️ Information"
        infoTitleLabel.font = UIFont.boldSystemFont(ofSize: 16)
        if #available(iOS 13.0, *) {
            infoTitleLabel.textColor = UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor(red: 0.89, green: 0.93, blue: 1.0, alpha: 1.0) : // secondary_1
                    UIColor(red: 0.24, green: 0.31, blue: 0.88, alpha: 1.0) // primary_1
            }
        } else {
            infoTitleLabel.textColor = UIColor(red: 0.24, green: 0.31, blue: 0.88, alpha: 1.0)
        }
        infoCard.addSubview(infoTitleLabel)
        
        // Configure info text
        infoTextLabel.translatesAutoresizingMaskIntoConstraints = false
        infoTextLabel.text = "The Yuno SDK is ready to use.\n\n• Enter the complete configuration JSON\n• Include country, language, merchantKeys and options\n• Press Start to continue\n• The SDK will initialize with your configuration\n• You will be able to test all functionalities"
        infoTextLabel.font = UIFont.systemFont(ofSize: 13)
        if #available(iOS 13.0, *) {
            infoTextLabel.textColor = UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor(red: 0.89, green: 0.93, blue: 1.0, alpha: 1.0) :
                    UIColor(red: 0.24, green: 0.31, blue: 0.88, alpha: 1.0)
            }
        } else {
            infoTextLabel.textColor = UIColor(red: 0.24, green: 0.31, blue: 0.88, alpha: 1.0)
        }
        infoTextLabel.numberOfLines = 0
        infoCard.addSubview(infoTextLabel)
        
        // Configure footer
        footerLabel.translatesAutoresizingMaskIntoConstraints = false
        footerLabel.text = getSDKVersion()
        footerLabel.font = UIFont.systemFont(ofSize: 12)
        if #available(iOS 13.0, *) {
            footerLabel.textColor = UIColor { traitCollection in
                traitCollection.userInterfaceStyle == .dark ?
                    UIColor(red: 0.61, green: 0.63, blue: 0.65, alpha: 1.0) : // grey_4 dark
                    UIColor(red: 0.57, green: 0.58, blue: 0.61, alpha: 1.0)  // grey_4 light
            }
        } else {
            footerLabel.textColor = UIColor(red: 0.57, green: 0.58, blue: 0.61, alpha: 1.0)
        }
        footerLabel.textAlignment = .center
        contentView.addSubview(footerLabel)
    }
    
    private func setupConstraints() {
        NSLayoutConstraint.activate([
            // Scroll view (respects safe area to avoid system bars)
            scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            
            // Content view
            contentView.topAnchor.constraint(equalTo: scrollView.topAnchor),
            contentView.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor),
            contentView.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor),
            contentView.widthAnchor.constraint(equalTo: scrollView.widthAnchor),
            
            // Header view
            headerView.topAnchor.constraint(equalTo: contentView.topAnchor),
            headerView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            headerView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            
            // Title
            titleLabel.topAnchor.constraint(equalTo: headerView.topAnchor, constant: 32),
            titleLabel.leadingAnchor.constraint(equalTo: headerView.leadingAnchor, constant: 32),
            titleLabel.trailingAnchor.constraint(equalTo: headerView.trailingAnchor, constant: -32),
            
            // Subtitle
            subtitleLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 8),
            subtitleLabel.leadingAnchor.constraint(equalTo: headerView.leadingAnchor, constant: 32),
            subtitleLabel.trailingAnchor.constraint(equalTo: headerView.trailingAnchor, constant: -32),
            subtitleLabel.bottomAnchor.constraint(equalTo: headerView.bottomAnchor, constant: -32),
            
            // Card view
            cardView.topAnchor.constraint(equalTo: headerView.bottomAnchor, constant: 24),
            cardView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 24),
            cardView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -24),
            
            // Card title
            cardTitleLabel.topAnchor.constraint(equalTo: cardView.topAnchor, constant: 24),
            cardTitleLabel.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 24),
            cardTitleLabel.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -24),
            
            // Instructions
            instructionsLabel.topAnchor.constraint(equalTo: cardTitleLabel.bottomAnchor, constant: 24),
            instructionsLabel.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 24),
            instructionsLabel.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -24),
            
            // Text view
            configTextView.topAnchor.constraint(equalTo: instructionsLabel.bottomAnchor, constant: 16),
            configTextView.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 24),
            configTextView.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -24),
            configTextView.heightAnchor.constraint(greaterThanOrEqualToConstant: 200),
            
            // Start button
            startButton.topAnchor.constraint(equalTo: configTextView.bottomAnchor, constant: 24),
            startButton.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 24),
            startButton.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -24),
            startButton.bottomAnchor.constraint(equalTo: cardView.bottomAnchor, constant: -24),
            
            // Info card
            infoCard.topAnchor.constraint(equalTo: cardView.bottomAnchor, constant: 16),
            infoCard.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 24),
            infoCard.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -24),
            
            // Info title
            infoTitleLabel.topAnchor.constraint(equalTo: infoCard.topAnchor, constant: 24),
            infoTitleLabel.leadingAnchor.constraint(equalTo: infoCard.leadingAnchor, constant: 24),
            infoTitleLabel.trailingAnchor.constraint(equalTo: infoCard.trailingAnchor, constant: -24),
            
            // Info text
            infoTextLabel.topAnchor.constraint(equalTo: infoTitleLabel.bottomAnchor, constant: 16),
            infoTextLabel.leadingAnchor.constraint(equalTo: infoCard.leadingAnchor, constant: 24),
            infoTextLabel.trailingAnchor.constraint(equalTo: infoCard.trailingAnchor, constant: -24),
            infoTextLabel.bottomAnchor.constraint(equalTo: infoCard.bottomAnchor, constant: -24),
            
            // Footer
            footerLabel.topAnchor.constraint(equalTo: infoCard.bottomAnchor, constant: 32),
            footerLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 24),
            footerLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -24),
            footerLabel.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -32)
        ])
    }
    
    private func setupKeyboardHandling() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillShow),
            name: UIResponder.keyboardWillShowNotification,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillHide),
            name: UIResponder.keyboardWillHideNotification,
            object: nil
        )
        
        // Add tap gesture to dismiss keyboard
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(dismissKeyboard))
        view.addGestureRecognizer(tapGesture)
    }
    
    // MARK: - Actions
    @objc private func startButtonTapped() {
        let configJson = configTextView.text.trimmingCharacters(in: .whitespacesAndNewlines)
        
        if configJson.isEmpty || configJson == "Enter the configuration JSON" {
            showAlert(title: "Error", message: "Please enter a valid configuration JSON")
            return
        }
        
        // Validate JSON format (same as Android)
        guard let data = configJson.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            showAlert(title: "Error", message: "Invalid JSON format")
            return
        }
        
        // Basic validation of required fields
        guard let merchantKeys = json["merchantKeys"] as? [String: Any],
              merchantKeys["publicKey"] != nil else {
            showAlert(title: "Error", message: "Missing API key in merchantKeys.publicKey")
            return
        }
        
        guard let country = json["country"] as? String else {
            showAlert(title: "Error", message: "Missing country field")
            return
        }
        
        guard json["options"] != nil else {
            showAlert(title: "Error", message: "Missing options field")
            return
        }
        
        print("📋 Configuration validated, navigating to React Native...")
        print("  - Country: \(country)")
        
        // Navigate to React Native with the config
        // React Native will initialize the SDK using @yuno/yuno-sdk-react-native
        navigateToReactNative(countryCode: country, configJson: configJson)
    }
    
    private func navigateToReactNative(countryCode: String, configJson: String) {
        let appDelegate = UIApplication.shared.delegate as! AppDelegate
        appDelegate.navigateToReactNative(withCountryCode: countryCode, configJson: configJson)
    }
    
    private func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    @objc private func keyboardWillShow(notification: NSNotification) {
        guard let keyboardFrame = notification.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect else { return }
        scrollView.contentInset.bottom = keyboardFrame.height
        scrollView.verticalScrollIndicatorInsets.bottom = keyboardFrame.height
    }
    
    @objc private func keyboardWillHide(notification: NSNotification) {
        scrollView.contentInset.bottom = 0
        scrollView.verticalScrollIndicatorInsets.bottom = 0
    }
    
    @objc private func dismissKeyboard() {
        view.endEditing(true)
    }
    
    // MARK: - UITextViewDelegate
    func textViewDidBeginEditing(_ textView: UITextView) {
        if textView.text == "Enter the configuration JSON" {
            textView.text = ""
            if #available(iOS 13.0, *) {
                textView.textColor = UIColor { traitCollection in
                    traitCollection.userInterfaceStyle == .dark ?
                        UIColor.white :
                        UIColor(red: 0.16, green: 0.16, blue: 0.19, alpha: 1.0)
                }
            } else {
                textView.textColor = UIColor(red: 0.16, green: 0.16, blue: 0.19, alpha: 1.0)
            }
        }
    }
    
    func textViewDidEndEditing(_ textView: UITextView) {
        if textView.text.isEmpty {
            textView.text = "Enter the configuration JSON"
            if #available(iOS 13.0, *) {
                textView.textColor = UIColor { traitCollection in
                    traitCollection.userInterfaceStyle == .dark ?
                        UIColor(red: 0.61, green: 0.63, blue: 0.65, alpha: 1.0) :
                        UIColor(red: 0.57, green: 0.58, blue: 0.61, alpha: 1.0)
                }
            } else {
                textView.textColor = UIColor(red: 0.57, green: 0.58, blue: 0.61, alpha: 1.0)
            }
        }
    }
    
    // MARK: - Helper Methods
    /**
     * Obtiene la versión del SDK desde Info.plist
     */
    private func getSDKVersion() -> String {
        // Leer desde Info.plist
        if let sdkVersion = Bundle.main.infoDictionary?["YunoSDKVersion"] as? String,
           !sdkVersion.isEmpty {
            return "Yuno SDK React Native v\(sdkVersion)"
        }
        
        // Fallback: usar versión por defecto
        return "Yuno SDK React Native v1.0.29"
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}
